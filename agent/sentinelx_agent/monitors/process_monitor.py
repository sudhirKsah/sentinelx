"""Process Monitor"""

import time
import logging
import psutil
from typing import Dict, Any
from sentinelx_agent.monitors import BaseMonitor

logger = logging.getLogger(__name__)

class ProcessMonitor(BaseMonitor):
    def __init__(self, config: Dict[str, Any], api_client):
        super().__init__(config, api_client)
        self.interval = config.get('process_interval', 30)
        self.suspicious_names = {'nmap', 'nc', 'netcat', 'hydra', 'john', 'sqlmap'}
        self.cpu_threshold = 90.0

    def monitor(self):
        """Monitor running processes"""
        time.sleep(self.interval)
        try:
            for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'cmdline']):
                try:
                    name = proc.info['name']
                    cpu = proc.info['cpu_percent']
                    cmdline = ' '.join(proc.info['cmdline']) if proc.info['cmdline'] else ''

                    # Detect suspicious process names
                    if name in self.suspicious_names:
                        self.add_event({
                            'event_type': 'suspicious_process',
                            'severity': 'high',
                            'title': f"Suspicious process detected: {name}",
                            'description': f"PID: {proc.info['pid']}, Command: {cmdline}"
                        })

                    # Detect high CPU usage
                    if cpu is not None and cpu > self.cpu_threshold:
                        self.add_event({
                            'event_type': 'high_cpu_usage',
                            'severity': 'medium',
                            'title': f"High CPU usage by process: {name}",
                            'description': f"PID: {proc.info['pid']} is using {cpu}% CPU"
                        })
                except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                    pass
        except Exception as e:
            logger.error(f"Process monitoring error: {e}")
