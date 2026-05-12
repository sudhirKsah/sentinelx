"""File Integrity Monitor"""

import os
import hashlib
import time
import logging
from pathlib import Path
from typing import Dict, Any
from sentinelx_agent.monitors import BaseMonitor

logger = logging.getLogger(__name__)

class FileIntegrityMonitor(BaseMonitor):
    def __init__(self, config: Dict[str, Any], api_client):
        super().__init__(config, api_client)
        self.paths = config.get('fim_paths', ['/root', '/home', '/etc'])
        self.exclude = set(config.get('fim_exclude', []))
        self.hash_algorithm = config.get('fim_hash_algorithm', 'sha256')
        self.interval = config.get('fim_interval', 60)
        self.file_hashes = {}
        self._build_baseline()

    def monitor(self):
        """Monitor files for changes"""
        time.sleep(self.interval)
        
        current_hashes = {}
        for path in self.paths:
            self._scan_directory(path, current_hashes)
        
        # Detect changes
        self._detect_changes(current_hashes)
        self.file_hashes = current_hashes

    def _scan_directory(self, path: str, hashes: Dict[str, str]):
        """Recursively scan directory"""
        try:
            for root, dirs, files in os.walk(path):
                # Skip excluded directories
                dirs[:] = [d for d in dirs if d not in self.exclude]
                
                for file in files:
                    try:
                        file_path = os.path.join(root, file)
                        if os.path.isfile(file_path) and os.access(file_path, os.R_OK):
                            file_hash = self._hash_file(file_path)
                            hashes[file_path] = file_hash
                    except Exception as e:
                        logger.debug(f"Error hashing {file_path}: {e}")
                        
        except Exception as e:
            logger.warning(f"Error scanning {path}: {e}")

    def _hash_file(self, file_path: str) -> str:
        """Calculate file hash"""
        hash_obj = hashlib.new(self.hash_algorithm)
        try:
            with open(file_path, 'rb') as f:
                for chunk in iter(lambda: f.read(4096), b''):
                    hash_obj.update(chunk)
            return hash_obj.hexdigest()
        except Exception as e:
            logger.debug(f"Cannot hash {file_path}: {e}")
            return ""

    def _detect_changes(self, current_hashes: Dict[str, str]):
        """Detect file modifications"""
        # New files
        for file_path, file_hash in current_hashes.items():
            if file_path not in self.file_hashes:
                self.add_event({
                    'event_type': 'file_created',
                    'severity': 'info',
                    'title': f"New file created: {file_path}",
                    'description': f"A new file was detected at {file_path}",
                    'raw_data': {'file_path': file_path}
                })
        
        # Modified files
        for file_path, old_hash in self.file_hashes.items():
            if file_path in current_hashes:
                if current_hashes[file_path] != old_hash:
                    self.add_event({
                        'event_type': 'file_modified',
                        'severity': 'medium',
                        'title': f"File modified: {file_path}",
                        'description': f"File content changed at {file_path}. Hash changed.",
                        'raw_data': {'file_path': file_path, 'old_hash': old_hash, 'new_hash': current_hashes[file_path]}
                    })
        
        # Deleted files
        for file_path in self.file_hashes:
            if file_path not in current_hashes:
                self.add_event({
                    'event_type': 'file_deleted',
                    'severity': 'medium',
                    'title': f"File deleted: {file_path}",
                    'description': f"File was removed from {file_path}",
                    'raw_data': {'file_path': file_path}
                })

    def _build_baseline(self):
        """Build initial file baseline"""
        logger.info("Building file integrity baseline...")
        for path in self.paths:
            self._scan_directory(path, self.file_hashes)
        logger.info(f"Baseline built: {len(self.file_hashes)} files tracked")
