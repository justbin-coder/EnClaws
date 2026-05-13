#!/usr/bin/env bash
set -euo pipefail

cd /repo

export QINGCLAWS_STATE_DIR="/tmp/qingclaws-test"
export QINGCLAWS_CONFIG_PATH="${QINGCLAWS_STATE_DIR}/qingclaws.json"

echo "==> Build"
pnpm build

echo "==> Seed state"
mkdir -p "${QINGCLAWS_STATE_DIR}/credentials"
mkdir -p "${QINGCLAWS_STATE_DIR}/agents/main/sessions"
echo '{}' >"${QINGCLAWS_CONFIG_PATH}"
echo 'creds' >"${QINGCLAWS_STATE_DIR}/credentials/marker.txt"
echo 'session' >"${QINGCLAWS_STATE_DIR}/agents/main/sessions/sessions.json"

echo "==> Reset (config+creds+sessions)"
pnpm qingclaws reset --scope config+creds+sessions --yes --non-interactive

test ! -f "${QINGCLAWS_CONFIG_PATH}"
test ! -d "${QINGCLAWS_STATE_DIR}/credentials"
test ! -d "${QINGCLAWS_STATE_DIR}/agents/main/sessions"

echo "==> Recreate minimal config"
mkdir -p "${QINGCLAWS_STATE_DIR}/credentials"
echo '{}' >"${QINGCLAWS_CONFIG_PATH}"

echo "==> Uninstall (state only)"
pnpm qingclaws uninstall --state --yes --non-interactive

test ! -d "${QINGCLAWS_STATE_DIR}"

echo "OK"
