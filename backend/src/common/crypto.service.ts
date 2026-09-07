import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'crypto';

/**
 * Application-level at-rest encryption for sensitive cloud credentials.
 *
 * Scheme: AES-256-GCM with a per-encryption random salt + IV.
 * The 32-byte key is derived from the ENCRYPTION_KEY env var via scrypt.
 *
 * Ciphertext format (string, all hex):
 *   enc:v1:<salt>:<iv>:<authTag>:<ciphertext>
 *
 * The ENCRYPTION_KEY env var can be any passphrase. For production, prefer a
 * 32-byte (64 hex char) random secret. Generate one with:
 *   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */
@Injectable()
export class CryptoService implements OnModuleInit {
  private readonly logger = new Logger(CryptoService.name);
  private readonly PREFIX = 'enc:v1';
  private readonly SCRYPT_KEY_LEN = 32;
  private readonly IV_LEN = 12; // 96-bit IV recommended for GCM
  private readonly SALT_LEN = 16;
  private cachedKey: Buffer | null = null;
  private cachedKeySource: string | null = null;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const key = this.configService.get<string>('ENCRYPTION_KEY');
    if (!key) {
      this.logger.warn(
        'ENCRYPTION_KEY is not set. Cloud credentials cannot be encrypted/decrypted. ' +
          'Set ENCRYPTION_KEY in your .env (generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))")',
      );
    } else if (key.length < 16) {
      this.logger.warn('ENCRYPTION_KEY is shorter than 16 chars — consider using a stronger secret.');
    }
  }

  private getKey(salt: Buffer): Buffer {
    const source = this.configService.get<string>('ENCRYPTION_KEY') || '';
    // Derive via scrypt. We re-derive per salt; scrypt is intentionally slow,
    // but salt changes only per-encryption so decrypt reuses the stored salt.
    return scryptSync(source, salt, this.SCRYPT_KEY_LEN);
  }

  /** Returns true if the value looks like an encrypted envelope. */
  isEncrypted(value: string | null | undefined): boolean {
    return !!value && value.startsWith(this.PREFIX + ':');
  }

  /**
   * Encrypt a plaintext string. Returns the envelope string.
   * Returns the input unchanged if it is empty or already encrypted.
   */
  encrypt(plaintext: string | null | undefined): string {
    if (plaintext == null || plaintext === '') return plaintext ?? '';
    if (this.isEncrypted(plaintext)) return plaintext; // idempotent
    if (!this.configService.get<string>('ENCRYPTION_KEY')) {
      throw new Error('ENCRYPTION_KEY is not configured; cannot encrypt credentials.');
    }
    const salt = randomBytes(this.SALT_LEN);
    const iv = randomBytes(this.IV_LEN);
    const key = this.getKey(salt);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return [this.PREFIX, salt.toString('hex'), iv.toString('hex'), authTag.toString('hex'), ciphertext.toString('hex')].join(':');
  }

  /**
   * Decrypt an envelope string. Returns the plaintext.
   * If the value is not an envelope (e.g. legacy plaintext), returns it unchanged
   * so existing rows keep working until they are re-saved.
   */
  decrypt(value: string | null | undefined): string {
    if (!value) return '';
    if (!this.isEncrypted(value)) return value; // legacy plaintext passthrough
    const parts = value.split(':');
    // ['enc','v1', salt, iv, authTag, ciphertext]
    if (parts.length !== 6) throw new Error('Malformed encrypted envelope');
    const salt = Buffer.from(parts[2], 'hex');
    const iv = Buffer.from(parts[3], 'hex');
    const authTag = Buffer.from(parts[4], 'hex');
    const ciphertext = Buffer.from(parts[5], 'hex');
    const key = this.getKey(salt);
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return plaintext.toString('utf8');
  }

  /** Mask a secret for safe display in API responses / logs. Shows first 4 + last 4. */
  mask(value: string | null | undefined): string {
    if (!value) return '';
    if (this.isEncrypted(value)) return '••••••••••••';
    if (value.length <= 8) return '••••••••';
    return `${value.slice(0, 4)}••••••••${value.slice(-4)}`;
  }
}
