"""Base Monitor Class"""

import threading
import logging
from typing import Dict, Any, List
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)

class BaseMonitor(ABC, threading.Thread):
    def __init__(self, config: Dict[str, Any], api_client):
        super().__init__(daemon=False)
        self.config = config
        self.api_client = api_client
        self.running = True
        self.event_batch = []
        self.batch_size = config.get('batch_size', 100)

    def run(self):
        """Main monitor loop"""
        logger.info(f"Starting {self.__class__.__name__}")
        try:
            while self.running:
                self.monitor()
        except Exception as e:
            logger.error(f"Monitor error in {self.__class__.__name__}: {e}")

    @abstractmethod
    def monitor(self):
        """Implement monitoring logic in subclass"""
        pass

    def add_event(self, event_data: Dict[str, Any]):
        """Add event to batch"""
        event_data['timestamp'] = __import__('datetime').datetime.utcnow().isoformat()
        event_data['source'] = 'agent'
        self.event_batch.append(event_data)
        
        if len(self.event_batch) >= self.batch_size:
            self.flush_events()

    def flush_events(self):
        """Send batched events to API"""
        if self.event_batch:
            self.api_client.send_events(self.event_batch)
            self.event_batch = []

    def stop(self):
        """Stop monitor gracefully"""
        self.running = False
        self.flush_events()
        self.join(timeout=5)
