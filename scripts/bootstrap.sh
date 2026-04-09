# shellcheck shell=sh
# openclaw Lightsail instance bootstrap script.
# Runs once via cloud-init userdata on first boot.
# NOTE: Lightsail cloud-init runs userdata via /bin/sh (dash), not bash.
# Do not use bashisms (pipefail, arrays, [[ ]]).

set -eu
export DEBIAN_FRONTEND=noninteractive

# --- System updates ---
apt-get update -y
apt-get upgrade -y

# --- Node.js 24 (openclaw requires Node 22.16+ or 24) ---
# Download then run — avoids pipe that could swallow a curl failure under sh (no pipefail).
curl -fsSL https://deb.nodesource.com/setup_24.x -o /tmp/nodesource_setup.sh
bash /tmp/nodesource_setup.sh
rm /tmp/nodesource_setup.sh
apt-get install -y nodejs

# --- openclaw ---
npm install -g openclaw@latest

echo "Bootstrap complete. Node $(node --version)."
echo "Next step: openclaw onboard --install-daemon"
