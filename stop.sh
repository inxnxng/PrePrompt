#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PIDFILE="$ROOT/log/server.pid"

if [[ ! -f "$PIDFILE" ]]; then
  echo "PID 파일이 없습니다. start.sh 로 시작했는지 확인하세요." >&2
  exit 1
fi

pid="$(cat "$PIDFILE" 2>/dev/null || true)"
if [[ -z "${pid}" ]]; then
  rm -f "$PIDFILE"
  echo "PID 파일이 비어 있습니다. 정리했습니다." >&2
  exit 1
fi

if ! kill -0 "${pid}" 2>/dev/null; then
  rm -f "$PIDFILE"
  echo "프로세스가 이미 종료되었습니다 (PID ${pid}). PID 파일을 정리했습니다."
  exit 0
fi

kill -TERM "${pid}" 2>/dev/null || true

for _ in {1..50}; do
  if ! kill -0 "${pid}" 2>/dev/null; then
    break
  fi
  sleep 0.1
done

if kill -0 "${pid}" 2>/dev/null; then
  kill -KILL "${pid}" 2>/dev/null || true
fi

rm -f "$PIDFILE"
echo "종료했습니다 (PID ${pid})."
