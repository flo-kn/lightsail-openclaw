# shellcheck shell=bash
# openclaw Lightsail instance bootstrap script.
# Runs once via cloud-init userdata on first boot.

set -eu
export DEBIAN_FRONTEND=noninteractive

# --- System updates ---
apt-get update -y
apt-get upgrade -y

# --- Node.js 24 (openclaw requires Node 22.16+ or 24) ---
curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
apt-get install -y nodejs

# --- openclaw ---
npm install -g openclaw@latest

echo "Bootstrap complete. Node $(node --version)."
echo "Next step: openclaw onboard --install-daemon"
