"""Network Monitor"""

import time
import logging
import psutil
from typing import Dict, Any
from sentinelx_agent.monitors import BaseMonitor

logger = logging.getLogger(__name__)

class NetworkMonitor(BaseMonitor):
    def __init__(self, config: Dict[str, Any], api_client):
        super().__init__(config, api_client)
        self.interval = config.get('network_interval', 30)
        # Ports typically not expected to be open on a standard endpoint
        self.suspicious_ports = {23, 4444, 1337, 31337}

    def monitor(self):
        """Monitor network connections"""
        time.sleep(self.interval)
        try:
            conns = psutil.net_connections(kind='inet')
            for conn in conns:
                if conn.status == 'LISTEN':
                    port = conn.laddr.port
                    if port in self.suspicious_ports:
                        self.add_event({
                            'event_type': 'suspicious_listening_port',
                            'severity': 'high',
                            'title': f"Suspicious port listening: {port}",
                            'description': f"PID: {conn.pid} is listening on {conn.laddr.ip}:{port}"
                        })
        except psutil.AccessDenied:
            logger.debug("NetworkMonitor: Access denied to read some connections. Run as root for full visibility.")
        except Exception as e:
            logger.error(f"Network monitoring error: {e}")
