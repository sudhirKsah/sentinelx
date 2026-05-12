#!/bin/bash

# SentinelX Cyber Attack Simulator
# Warning: Do NOT run this script on a production server.
# This script is strictly for demonstrating the detection capabilities of the SentinelX Agent.

echo "🛡️  Starting SentinelX Attack Simulator..."
echo "=========================================="
sleep 2

# 1. Triggering File Integrity Monitor (FIM)
echo "[1/4] Simulating File Modification Attack..."
echo ">> Modifying critical system file (/etc/hosts proxy simulation)..."
# We won't actually touch /etc/hosts without sudo, so let's touch a watched directory if possible
# The agent by default watches /etc, /root, /home. Let's create a fake backdoor in /home.
mkdir -p /home/$USER/.hidden_config
echo "malicious_payload=1" > /home/$USER/.hidden_config/backdoor.sh
chmod +x /home/$USER/.hidden_config/backdoor.sh
echo ">> Modified /home/$USER/.hidden_config/backdoor.sh"
echo ""

# 2. Triggering Process Monitor (Suspicious Process)
echo "[2/4] Simulating Suspicious Process Execution..."
echo ">> Running 'nmap' (Network Scanner)..."
# We just rename bash to nmap and run it for 5 seconds to trick the process monitor
cp /bin/bash /tmp/nmap
/tmp/nmap -c "sleep 80" &
sleep 1
echo ">> Running 'nc' (Netcat / Reverse Shell)..."
cp /bin/bash /tmp/nc
/tmp/nc -c "sleep 80" &
echo ""

# 3. Triggering Network Monitor (Unauthorized Port Binding)
echo "[3/4] Simulating Unauthorized Network Binding..."
echo ">> Opening a suspicious high port listener (simulating C2 server)..."
python3 -m http.server 4444 > /dev/null 2>&1 &
DUMMY_PID=$!
echo ">> Malicious listener open on port 4444."
echo ""

echo "⏳ Waiting for 70 seconds to ensure SentinelX Agent polling intervals (FIM, Process, Network) catch these artifacts..."
sleep 70
echo ">> Artifacts detected! Proceeding to cleanup."
echo ""

kill $DUMMY_PID
echo ">> Closed malicious listener."

# 4. Cleanup
echo "[4/4] Cleaning up simulated artifacts..."
rm -f /home/$USER/.hidden_config/backdoor.sh
rm -f /tmp/nmap
rm -f /tmp/nc
echo ""

echo "✅ Simulation Complete!"
echo "Check your SentinelX Dashboard (Alerts & Incidents tabs) to see the detections!"
