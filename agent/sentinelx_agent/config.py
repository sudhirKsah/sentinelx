"""SentinelX Agent Configuration"""

import os
import json
import base64
import socket
from pathlib import Path
from typing import Dict, Any

def _parse_jwt(token: str) -> Dict[str, Any]:
    if not token:
        return {}
    try:
        payload = token.split('.')[1]
        payload += '=' * (-len(payload) % 4)
        return json.loads(base64.b64decode(payload).decode('utf-8'))
    except Exception:
        return {}

def load_config() -> Dict[str, Any]:
    """Load agent configuration from environment and config file"""
    
    token = os.getenv('SENTINELX_TOKEN', '')
    token_data = _parse_jwt(token)
    
    config = {
        # API Configuration
        'api_url': os.getenv('SENTINELX_API_URL', 'http://localhost:3000'),
        'api_key': token or os.getenv('SENTINELX_API_KEY', ''),
        'org_id': token_data.get('org_id') or os.getenv('SENTINELX_ORG_ID', ''),
        'agent_id': os.getenv('SENTINELX_AGENT_ID', ''),
        
        # Agent Configuration
        'hostname': os.getenv('HOSTNAME', socket.gethostname()),
        'os_type': os.getenv('OS_TYPE', 'linux'),
        'agent_version': '0.1.0',
        
        # Monitoring Configuration
        'enable_file_integrity': os.getenv('ENABLE_FILE_INTEGRITY', 'true').lower() == 'true',
        'enable_process_monitoring': os.getenv('ENABLE_PROCESS_MONITORING', 'true').lower() == 'true',
        'enable_user_activity': os.getenv('ENABLE_USER_ACTIVITY', 'true').lower() == 'true',
        'enable_network_monitoring': os.getenv('ENABLE_NETWORK_MONITORING', 'true').lower() == 'true',
        
        # File Integrity Monitoring
        'fim_paths': os.getenv('FIM_PATHS', '/root,/home,/etc').split(','),
        'fim_exclude': os.getenv('FIM_EXCLUDE', '.cache,.git,__pycache__').split(','),
        'fim_hash_algorithm': os.getenv('FIM_HASH_ALGORITHM', 'sha256'),
        'fim_interval': int(os.getenv('FIM_INTERVAL', '60')),  # seconds
        
        # Process Monitoring
        'process_interval': int(os.getenv('PROCESS_INTERVAL', '30')),
        'monitor_network_connections': os.getenv('MONITOR_NETWORK_CONNECTIONS', 'true').lower() == 'true',
        
        # User Activity Monitoring
        'user_activity_interval': int(os.getenv('USER_ACTIVITY_INTERVAL', '60')),
        
        # Logging
        'log_level': os.getenv('LOG_LEVEL', 'INFO'),
        'log_file': os.getenv('LOG_FILE', 'logs/sentinelx-agent.log'),
        
        # SSL/TLS
        'verify_ssl': os.getenv('VERIFY_SSL', 'true').lower() == 'true',
        'ssl_cert_path': os.getenv('SSL_CERT_PATH', ''),
        
        # Batch Configuration
        'batch_size': int(os.getenv('BATCH_SIZE', '100')),
        'batch_timeout': int(os.getenv('BATCH_TIMEOUT', '30')),  # seconds
    }
    
    # Load from config file if exists
    config_file = Path(os.getenv('AGENT_CONFIG_FILE', 'config/agent.json'))
    if config_file.exists():
        try:
            with open(config_file) as f:
                file_config = json.load(f)
                config.update(file_config)
        except Exception as e:
            print(f"Warning: Failed to load config file: {e}")
    
    return config
