#!/bin/bash
# CAD Data Monitor — checks TX CAD sites for 2026 data references
# Runs every 12 hours, notifies via OpenClaw only if new findings

WORKSPACE="/Users/lab/.openclaw/workspace/overtaxed"
STATE_FILE="$WORKSPACE/scripts/.cad-monitor-state.json"
FINDINGS_FILE="/tmp/cad-monitor-findings-$(date +%s).txt"

# Initialize state file if missing
if [ ! -f "$STATE_FILE" ]; then
  echo '{}' > "$STATE_FILE"
fi

# URLs to check
declare -A URLS
URLS=(
  ["Harris (HCAD)"]="https://pdata.hcad.org/download"
  ["Dallas"]="https://www.dallascad.org/SearchOwner.aspx"
  ["Collin"]="https://www.collincad.org/downloads"
  ["Tarrant"]="https://www.tad.org/data-download/"
  ["Denton"]="https://dentoncad.com/Data/DataProducts"
  ["Rockwall"]="https://www.rockwallcad.com/"
  ["Travis"]="https://traviscad.org/publicinformation"
  ["Williamson"]="https://www.wcad.org/property-data-downloads/"
  ["Fort Bend"]="https://www.fbcad.org/public-data"
)

FOUND_NEW=0

for county in "${!URLS[@]}"; do
  url="${URLS[$county]}"
  # Fetch page content
  content=$(curl -sL --max-time 15 "$url" 2>/dev/null | grep -ioE '.{0,80}2026.{0,80}' | head -5)
  
  if [ -n "$content" ]; then
    # Hash current findings
    current_hash=$(echo "$content" | md5 -q 2>/dev/null || echo "$content" | md5sum | cut -d' ' -f1)
    prev_hash=$(python3 -c "import json; d=json.load(open('$STATE_FILE')); print(d.get('$county',''))" 2>/dev/null)
    
    if [ "$current_hash" != "$prev_hash" ]; then
      FOUND_NEW=1
      echo "🔔 **$county** ($url):" >> "$FINDINGS_FILE"
      echo "$content" >> "$FINDINGS_FILE"
      echo "" >> "$FINDINGS_FILE"
      # Update state
      python3 -c "
import json
with open('$STATE_FILE','r') as f: d=json.load(f)
d['$county']='$current_hash'
with open('$STATE_FILE','w') as f: json.dump(d,f)
"
    fi
  fi
done

# Only notify if we found something new
if [ "$FOUND_NEW" -eq 1 ]; then
  FINDINGS=$(cat "$FINDINGS_FILE")
  # Use openclaw to send notification
  openclaw message send --channel telegram --target 8532734383 --message "🏠 **CAD Data Monitor Alert**

Found new 2026 references on TX CAD sites:

$FINDINGS

Check these sites for fresh data drops."
fi

rm -f "$FINDINGS_FILE"
