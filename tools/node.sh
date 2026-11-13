#!/usr/bin/env bash
# Project-local Node/npm wrapper. No global installation or PATH changes.
set -euo pipefail
TOOLS_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname -- "$TOOLS_DIR")"
VERSION="$(tr -d '\r\n' < "$TOOLS_DIR/node-version.txt")"
MODE="${1:?Expected node or npm}"
shift
case "$(uname -s)" in
  Darwin) PLATFORM=darwin ;;
  Linux) PLATFORM=linux ;;
  *) echo 'Use the .cmd wrappers on Windows.' >&2; exit 1 ;;
esac
case "$(uname -m)" in
  arm64|aarch64) ARCH=arm64 ;;
  x86_64|amd64) ARCH=x64 ;;
  *) echo 'Supported processors: x64 and ARM64.' >&2; exit 1 ;;
esac
NAME="node-v$VERSION-$PLATFORM-$ARCH"
CACHE="$PROJECT_DIR/.tools"
NODE_HOME="$CACHE/$NAME"
if [ ! -x "$NODE_HOME/bin/node" ]; then
  mkdir -p "$CACHE"
  # A lock prevents two launchers from installing over one another.
  LOCK="$CACHE/$NAME.lock"
  if ! mkdir "$LOCK" 2>/dev/null; then
    echo "Another Node download may be running. Wait for it, then retry. If it was interrupted, remove $LOCK" >&2
    exit 1
  fi
  TEMP_DIR="$(mktemp -d "$CACHE/download.XXXXXX")"
  trap 'rm -rf -- "$TEMP_DIR" "$LOCK"' EXIT
  FILE="$NAME.tar.gz"
  URL="https://nodejs.org/dist/v$VERSION/$FILE"
  echo "Downloading Node $VERSION ($PLATFORM/$ARCH) for this project..." >&2
  if command -v curl >/dev/null 2>&1; then
    curl --fail --location --retry 2 --connect-timeout 20 --max-time 600 "$URL" -o "$TEMP_DIR/$FILE"
  elif command -v wget >/dev/null 2>&1; then
    wget --timeout=60 --tries=3 "$URL" -O "$TEMP_DIR/$FILE"
  else
    echo 'curl or wget is required to download Node.' >&2; exit 1
  fi
  EXPECTED="$(awk -v file="$FILE" '$2 == file {print $1}' "$TOOLS_DIR/node-SHASUMS256.txt")"
  if [ -z "$EXPECTED" ]; then echo 'No checksum for this platform.' >&2; exit 1; fi
  if command -v shasum >/dev/null 2>&1; then
    ACTUAL="$(shasum -a 256 "$TEMP_DIR/$FILE" | awk '{print $1}')"
  elif command -v sha256sum >/dev/null 2>&1; then
    ACTUAL="$(sha256sum "$TEMP_DIR/$FILE" | awk '{print $1}')"
  else
    echo 'shasum or sha256sum is required to verify Node.' >&2; exit 1
  fi
  if [ "$ACTUAL" != "$EXPECTED" ]; then echo 'Node download checksum mismatch. Retry.' >&2; exit 1; fi
  tar -xzf "$TEMP_DIR/$FILE" -C "$TEMP_DIR"
  mv -- "$TEMP_DIR/$NAME" "$NODE_HOME"
  rm -rf -- "$TEMP_DIR" "$LOCK"
  trap - EXIT
fi
export PATH="$NODE_HOME/bin:$PATH"
case "$MODE" in
  node) exec "$NODE_HOME/bin/node" "$@" ;;
  npm) exec "$NODE_HOME/bin/node" "$NODE_HOME/lib/node_modules/npm/bin/npm-cli.js" "$@" ;;
  *) echo 'Expected node or npm.' >&2; exit 1 ;;
esac
