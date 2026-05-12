"""SentinelX Agent API Client"""

import requests
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

logger = logging.getLogger(__name__)

class APIClient:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.api_url = config['api_url']
        self.api_key = config['api_key']
        self.org_id = config['org_id']
        self.agent_id = config['agent_id']
        
        # Create session with retries
        self.session = requests.Session()
        retry_strategy = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["HEAD", "GET", "POST", "PUT", "DELETE"]
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)

    def register_agent(self) -> Optional[Dict[str, Any]]:
        """Register agent with backend"""
        try:
            endpoint = f"{self.api_url}/api/v1/agents/register"
            payload = {
                "hostname": self.config.get('hostname'),
                "os_type": self.config.get('os_type'),
                "agent_version": self.config.get('agent_version'),
            }
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            response = self.session.post(
                endpoint,
                json=payload,
                headers=headers,
                timeout=10,
                verify=self.config.get('verify_ssl', True)
            )
            
            if response.status_code == 201:
                data = response.json()
                self.agent_id = data.get('id')
                logger.info(f"✅ Agent registered: {self.agent_id}")
                return data
            else:
                logger.error(f"❌ Registration failed: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Registration error: {e}")
            return None

    def send_heartbeat(self) -> bool:
        """Send heartbeat to backend"""
        try:
            endpoint = f"{self.api_url}/api/v1/agents/{self.agent_id}/heartbeat"
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "status": "online",
                "timestamp": datetime.utcnow().isoformat()
            }
            
            response = self.session.post(
                endpoint,
                json=payload,
                headers=headers,
                timeout=5,
                verify=self.config.get('verify_ssl', True)
            )
            
            return response.status_code in [200, 204]
            
        except Exception as e:
            logger.warning(f"Heartbeat error: {e}")
            return False

    def send_events(self, events: List[Dict[str, Any]]) -> bool:
        """Send batch of events to backend"""
        if not events:
            return True
            
        try:
            endpoint = f"{self.api_url}/api/v1/events"
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "agent_id": self.agent_id,
                "events": events,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            response = self.session.post(
                endpoint,
                json=payload,
                headers=headers,
                timeout=30,
                verify=self.config.get('verify_ssl', True)
            )
            
            if response.status_code in [200, 201, 204]:
                logger.debug(f"✅ Sent {len(events)} events")
                return True
            else:
                logger.error(f"❌ Failed to send events: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Send events error: {e}")
            return False

    def get_baseline(self, event_type: str) -> Optional[Dict[str, Any]]:
        """Get baseline data for comparison"""
        try:
            endpoint = f"{self.api_url}/api/v1/agents/{self.agent_id}/baseline/{event_type}"
            headers = {
                "Authorization": f"Bearer {self.api_key}"
            }
            
            response = self.session.get(
                endpoint,
                headers=headers,
                timeout=10,
                verify=self.config.get('verify_ssl', True)
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                return None
                
        except Exception as e:
            logger.error(f"Get baseline error: {e}")
            return None
