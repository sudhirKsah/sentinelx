#!/usr/bin/env python3
"""
SentinelX Agent - Lightweight endpoint monitoring
Monitors: File integrity, process execution, user activity, network connections
"""

import os
import sys
import time
import threading
import logging
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sentinelx_agent.config import load_config
from sentinelx_agent.logger import setup_logger
from sentinelx_agent.api_client import APIClient
from sentinelx_agent.monitors.file_integrity_monitor import FileIntegrityMonitor
from sentinelx_agent.monitors.process_monitor import ProcessMonitor
from sentinelx_agent.monitors.user_activity_monitor import UserActivityMonitor
from sentinelx_agent.monitors.network_monitor import NetworkMonitor

logger = setup_logger(__name__)

class SentinelXAgent:
    def __init__(self):
        self.config = load_config()
        self.api_client = APIClient(self.config)
        self.monitors = []
        self._initialize_monitors()

    def _initialize_monitors(self):
        """Initialize all monitoring modules"""
        logger.info("Initializing SentinelX Agent monitors...")
        
        self.monitors.append(FileIntegrityMonitor(self.config, self.api_client))
        self.monitors.append(ProcessMonitor(self.config, self.api_client))
        self.monitors.append(UserActivityMonitor(self.config, self.api_client))
        self.monitors.append(NetworkMonitor(self.config, self.api_client))

    def _heartbeat_loop(self):
        """Background thread to send heartbeats"""
        while self.running:
            self.api_client.send_heartbeat()
            # Sleep for 60 seconds, checking every second if we should exit
            for _ in range(60):
                if not self.running:
                    break
                time.sleep(1)

    def start(self):
        """Start all monitoring threads"""
        self.running = True
        logger.info("🚀 Starting SentinelX Agent...")
        
        # Register agent with backend
        registration_data = self.api_client.register_agent()
        if not registration_data:
            logger.error("❌ Failed to register agent with backend. Cannot start monitors.")
            sys.exit(1)
            
        try:
            for monitor in self.monitors:
                monitor.start()
                logger.info(f"✅ Started {monitor.__class__.__name__}")
            
            # Start heartbeat thread
            self.heartbeat_thread = threading.Thread(target=self._heartbeat_loop, daemon=True)
            self.heartbeat_thread.start()
            logger.info("✅ Started Heartbeat Monitor")
            
            # Keep the agent running
            for monitor in self.monitors:
                monitor.join()
                
        except KeyboardInterrupt:
            logger.info("⚠️ Shutting down gracefully...")
            self.stop()
        except Exception as e:
            logger.error(f"❌ Agent error: {e}", exc_info=True)
            sys.exit(1)

    def stop(self):
        """Stop all monitors"""
        self.running = False
        for monitor in self.monitors:
            monitor.stop()
            logger.info(f"Stopped {monitor.__class__.__name__}")

if __name__ == "__main__":
    agent = SentinelXAgent()
    agent.start()
