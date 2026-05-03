"""User Activity Monitor"""

import time
import logging
import psutil
from typing import Dict, Any
from sentinelx_agent.monitors import BaseMonitor

logger = logging.getLogger(__name__)

class UserActivityMonitor(BaseMonitor):
    def __init__(self, config: Dict[str, Any], api_client):
        super().__init__(config, api_client)
        self.interval = config.get('user_activity_interval', 60)
        self.known_users = set()

    def monitor(self):
        """Monitor user activity"""
        time.sleep(self.interval)
        try:
            current_users = psutil.users()
            current_usernames = {u.name for u in current_users}

            # If this is the first run, just baseline
            if not self.known_users:
                self.known_users = current_usernames
                return

            # Detect new users logging in
            new_users = current_usernames - self.known_users
            if new_users:
                for user in new_users:
                    # Find terminal/host info if available
                    terminal = next((u.terminal for u in current_users if u.name == user), "unknown")
                    host = next((u.host for u in current_users if u.name == user), "unknown")
                    
                    self.add_event({
                        'event_type': 'new_user_login',
                        'severity': 'medium',
                        'title': f"New user session: {user}",
                        'description': f"User {user} logged in on {terminal} from {host}"
                    })

            self.known_users = current_usernames
            
        except Exception as e:
            logger.error(f"User activity monitoring error: {e}")
