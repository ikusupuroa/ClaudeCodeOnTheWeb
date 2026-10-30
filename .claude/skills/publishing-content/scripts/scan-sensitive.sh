#!/usr/bin/env bash
# 掃描文章裡可能沒換掉的敏感資訊。
# 用法：bash scan-sensitive.sh <檔案或資料夾> [...]
# 只列出可疑的行，要逐筆人工判斷（例如版號 1.2.3.4、說明文字裡的 token 一詞都不是問題）。
# 有可疑的行時 exit 1，完全沒有時 exit 0。
set -u

if [ $# -eq 0 ]; then
  echo "用法：bash scan-sensitive.sh <檔案或資料夾> [...]" >&2
  exit 1
fi

found=0
check() {
  local label="$1" pattern="$2" exclude="${3:-}"
  local out
  out=$(grep -rnEi --include='*.md' --include='*.sh' --include='*.yaml' "$pattern" "${@:4}" 2>/dev/null)
  if [ -n "$exclude" ] && [ -n "$out" ]; then
    out=$(printf '%s\n' "$out" | grep -vEi "$exclude")
  fi
  if [ -n "$out" ]; then
    found=1
    echo "== $label =="
    printf '%s\n' "$out"
  fi
}

# IPv4：192.0.2.x 是文件範例專用位址（RFC 5737），可以留
check "IPv4" '\b([0-9]{1,3}\.){3}[0-9]{1,3}\b' '192\.0\.2\.' "$@"
# IPv6：2001:db8:: 是文件範例專用位址（RFC 3849），可以留
check "IPv6" '\b([0-9a-f]{1,4}:){3,7}[0-9a-f]{1,4}\b' '2001:db8:' "$@"
# MAC：00:00:5e:00:53:xx 是文件範例專用位址（RFC 7042），可以留
check "MAC" '\b([0-9a-f]{2}:){5}[0-9a-f]{2}\b' '00:00:5e:00:53:' "$@"
# Email：noreply 類的系統位址可以留
check "Email" '[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}' 'noreply@|@example\.com' "$@"
# 提示字元：只能是 user@ubuntu-lab（可接編號）
check "提示字元" '\b[a-z0-9_-]+@[a-z0-9_-]+:[~/]' 'user@ubuntu-lab[0-9]*:' "$@"
# 本機路徑：只能是 /home/user
check "本機路徑" '/home/[a-z0-9_-]+' '/home/user\b' "$@"
# Token、密碼、金鑰；Ubuntu Pro token 以 C1 開頭
check "Token／密碼" 'password|passwd|secret|\bC1[0-9a-z]{20,}' '<已遮蔽>' "$@"

if [ "$found" -eq 0 ]; then
  echo "✓ 沒有可疑的項目"
fi
exit "$found"
