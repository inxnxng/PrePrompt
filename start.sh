#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

NEXT_BIN="$ROOT/node_modules/.bin/next"
if [[ ! -x "$NEXT_BIN" ]]; then
  echo "next 실행 파일이 없습니다. 먼저 npm install 을 실행하세요." >&2
  exit 1
fi

mkdir -p "$ROOT/log"
PIDFILE="$ROOT/log/server.pid"
LOGFILE="$ROOT/log/server.log"
PORT="${PORT:-3000}"

if [[ -f "$PIDFILE" ]]; then
  old_pid="$(cat "$PIDFILE" 2>/dev/null || true)"
  if [[ -n "${old_pid}" ]] && kill -0 "${old_pid}" 2>/dev/null; then
    echo "이미 실행 중입니다 (PID ${old_pid}). 먼저 ./stop.sh 로 종료한 뒤 다시 시작합니다."
    "$ROOT/stop.sh"
    sleep 0.5
  else
    rm -f "$PIDFILE"
  fi
fi

if command -v lsof >/dev/null 2>&1; then
  if lsof -ti:"${PORT}" -sTCP:LISTEN >/dev/null 2>&1; then
    if [[ -f "$PIDFILE" ]]; then
      echo "포트 ${PORT}가 사용 중입니다. ./stop.sh 로 정리한 뒤 다시 시작합니다."
      "$ROOT/stop.sh" || true
      sleep 0.5
    fi
    if lsof -ti:"${PORT}" -sTCP:LISTEN >/dev/null 2>&1; then
      echo "포트 ${PORT}가 여전히 사용 중입니다. 다른 터미널의 next 등을 종료한 뒤 다시 실행하세요." >&2
      echo "확인: lsof -nP -iTCP:${PORT} -sTCP:LISTEN" >&2
      exit 1
    fi
  fi
fi

nohup env PORT="${PORT}" "${NEXT_BIN}" dev -p "${PORT}" >"${LOGFILE}" 2>&1 &

echo $! >"${PIDFILE}"
echo "시작했습니다 (PORT=${PORT}, PID $(cat "${PIDFILE}"))"
echo "주소: http://localhost:${PORT}"
echo "로그: ${LOGFILE}"
