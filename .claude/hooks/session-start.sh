#!/bin/bash
# Claude Code 雲端工作階段啟動時執行：確保 Node.js 符合 Astro 7 的需求（>= 22.23.4），並安裝套件。
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

MIN_NODE="22.23.4"
NODE_DIR="$HOME/.local/node24"

node_ok() {
  command -v node >/dev/null 2>&1 &&
    node -e "const [a,b,c]=process.versions.node.split('.').map(Number),[x,y,z]='$MIN_NODE'.split('.').map(Number);process.exit(a>x||(a===x&&(b>y||(b===y&&c>=z)))?0:1)"
}

if [ -x "$NODE_DIR/bin/node" ]; then
  export PATH="$NODE_DIR/bin:$PATH"
fi

if ! node_ok; then
  echo "Node.js $(node -v 2>/dev/null || echo 'not found') < $MIN_NODE，安裝 Node 24 LTS…" >&2
  VERSION=$(curl -fsSL https://nodejs.org/dist/index.json |
    python3 -c "import json,sys;print(next(r['version'] for r in json.load(sys.stdin) if r['lts'] and r['version'].startswith('v24')))")
  rm -rf "$NODE_DIR" && mkdir -p "$NODE_DIR"
  curl -fsSL "https://nodejs.org/dist/$VERSION/node-$VERSION-linux-x64.tar.xz" | tar -xJ -C "$NODE_DIR" --strip-components=1
  export PATH="$NODE_DIR/bin:$PATH"
fi

# 讓這個工作階段後續的指令都用到正確的 Node
if [ -n "${CLAUDE_ENV_FILE:-}" ] && [ -x "$NODE_DIR/bin/node" ]; then
  echo "export PATH=\"$NODE_DIR/bin:\$PATH\"" >> "$CLAUDE_ENV_FILE"
fi

npm install --no-audit --no-fund
echo "Node $(node -v)，套件安裝完成。" >&2
