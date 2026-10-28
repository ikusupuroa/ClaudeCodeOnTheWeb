#!/usr/bin/env bash
# ==============================================================================
# profix.sh - Ubuntu CVE 漏洞即時通報與診斷工具 (繁體中文版 / 對齊 pro fix 規格)
# ==============================================================================
# 使用方式:
#   bash profix.sh [--dry-run] <CVE-編號-1> [CVE-編號-2 ...]
#   bash profix.sh <CVE-編號-1> [CVE-編號-2 ...] [--dry-run]
# 範例:
#   bash profix.sh CVE-2026-109618
#   bash profix.sh --dry-run CVE-2026-109618 CVE-2026-109619
# ==============================================================================

# 1. 參數解析（支援 --dry-run 與多個以空格分隔之 CVE 編號）
DRY_RUN=false
CVE_LIST=()
MAX_CVES=30  # 設定單次查詢安全上限為 30 筆，避免大量請求觸發 Canonical 官方 API 限流

for arg in "$@"; do
  if [ "$arg" = "--dry-run" ]; then
    DRY_RUN=true
  elif [[ "$arg" != -* ]]; then
    CVE_LIST+=("$arg")
  fi
done

if [ ${#CVE_LIST[@]} -eq 0 ]; then
  echo "使用方式: bash profix.sh [--dry-run] <CVE-編號-1> [CVE-編號-2 ...]"
  echo "範例:     bash profix.sh CVE-2026-109618"
  echo "          bash profix.sh --dry-run CVE-2026-109618 CVE-2026-109619"
  exit 1
fi

if [ ${#CVE_LIST[@]} -gt $MAX_CVES ]; then
  echo "錯誤：單次輸入之 CVE 數量（${#CVE_LIST[@]} 筆）超過安全上限（${MAX_CVES} 筆）。"
  echo "原因：為避免短時間密集連線觸發 Canonical 官方資安 API 之限流（Rate Limit）機制。"
  echo "建議：請分批執行（每次最多 ${MAX_CVES} 筆）。"
  exit 1
fi

# 2. 若使用 --dry-run，輸出繁體中文標準警示
if [ "$DRY_RUN" = true ]; then
  echo "警告：目前正使用 --dry-run 模擬執行模式。"
  echo "執行此指令時不會安裝或變更系統上的任何套件。"
  echo ""
fi

# 3. 自動偵測當前發行版代號（支援現代 /etc/os-release 與舊版 /etc/lsb-release）
CODENAME=""
if [ -f /etc/os-release ]; then
  CODENAME=$(grep -E '^(VERSION_CODENAME|UBUNTU_CODENAME)=' /etc/os-release | head -n1 | cut -d'=' -f2 | tr -d '"')
fi

if [ -z "$CODENAME" ] && [ -f /etc/lsb-release ]; then
  CODENAME=$(grep 'DISTRIB_CODENAME' /etc/lsb-release | cut -d'=' -f2 | tr -d '"')
fi

if [ -z "$CODENAME" ] && command -v lsb_release >/dev/null 2>&1; then
  CODENAME=$(lsb_release -cs 2>/dev/null || true)
fi

CODENAME="${CODENAME:-trusty}"

# 4. 偵測 HTTP 下載工具 (curl 或 wget)
HTTP_TOOL=""
if command -v curl >/dev/null 2>&1; then
  HTTP_TOOL="curl"
elif command -v wget >/dev/null 2>&1; then
  HTTP_TOOL="wget"
else
  echo "錯誤：系統未安裝 curl 或 wget。請先執行: sudo apt-get install -y curl"
  exit 1
fi

# 5. 偵測 Python 直譯器
PYTHON_BIN=""
if command -v python3 >/dev/null 2>&1; then
  PYTHON_BIN="python3"
elif command -v python >/dev/null 2>&1; then
  PYTHON_BIN="python"
else
  echo "錯誤：系統未找到 Python 環境，請確認系統完整性。"
  exit 1
fi

# 6. 定義 Python 診斷解析器函數
run_diagnosis() {
  local json_file="$1"
  local release_codename="$2"
  local is_dry_run="$3"

  $PYTHON_BIN - "$json_file" "$release_codename" "$is_dry_run" << 'EOF'
import sys, json, subprocess, io

json_file = sys.argv[1]
codename = sys.argv[2]
dry_run = (sys.argv[3].lower() == 'true')

try:
    with io.open(json_file, "r", encoding="utf-8", errors="ignore") as f:
        data = json.load(f)
except Exception:
    print("錯誤：無法解析 Canonical 官方回傳之資料格式。")
    sys.exit(1)

cve_id = data.get('id', '')
if not cve_id:
    print("錯誤：Canonical 官方資安資料庫中查無此 CVE，請確認編號是否正確。")
    sys.exit(1)

title = (data.get('title') or '').strip()
packages_data = data.get('packages', [])

if title:
    print("{}: {}".format(cve_id, title))
else:
    pkg_names = [p.get('name') for p in packages_data if p.get('name')]
    if pkg_names and len(pkg_names) == 1:
        print("{}: {} 安全漏洞".format(cve_id, pkg_names[0]))
    else:
        print("{}: \n[無詳細漏洞描述]".format(cve_id))

print(" - https://ubuntu.com/security/{}".format(cve_id))
notices = [n.get('id') for n in data.get('notices', []) if n.get('id')]
if notices:
    print(" - 官方安全公告: {}".format(", ".join(notices)))
print("")

# 讀取本機 dpkg 狀態
installed_binaries = {}
source_to_bins = {}

try:
    with io.open("/var/lib/dpkg/status", "r", encoding="utf-8", errors="ignore") as f:
        status_content = f.read()
except Exception:
    status_content = ""

if status_content:
    current = {}
    for line in status_content.splitlines():
        if not line.strip():
            if current.get("Status") == "install ok installed":
                pkg = current.get("Package")
                ver = current.get("Version")
                src = current.get("Source", pkg).split()[0]
                if pkg and ver:
                    installed_binaries[pkg] = (ver, src)
                    source_to_bins.setdefault(src, []).append((pkg, ver))
            current = {}
        elif ":" in line and not line.startswith(" "):
            k, v = line.split(":", 1)
            current[k.strip()] = v.strip()
    if current.get("Status") == "install ok installed":
        pkg = current.get("Package")
        ver = current.get("Version")
        src = current.get("Source", pkg).split()[0]
        if pkg and ver:
            installed_binaries[pkg] = (ver, src)
            source_to_bins.setdefault(src, []).append((pkg, ver))
else:
    try:
        out = subprocess.check_output(
            ["dpkg-query", "-W", "-f=${Package}:::${Source}:::${Version}:::${Status}\n"],
            stderr=subprocess.STDOUT
        ).decode("utf-8", "ignore")
        for line in out.splitlines():
            parts = line.strip().split(":::")
            if len(parts) == 4 and "install ok installed" in parts[3]:
                p, s, v = parts[0], parts[1], parts[2]
                src_clean = s.split()[0] if s else p
                installed_binaries[p] = (v, src_clean)
                source_to_bins.setdefault(src_clean, []).append((p, v))
    except Exception:
        pass

# 篩選在當前發行版代號下受影響的來源套件（Source Packages）
affected_sources = []
for p in packages_data:
    src_name = p.get('name')
    for st in p.get('statuses', []):
        if st.get('release_codename') == codename:
            st_val = (st.get('status') or 'unknown').lower()
            # 若官方標註為 not-affected 或 dne，代表該發行版本不受此漏洞影響
            if st_val not in ['not-affected', 'dne']:
                affected_sources.append({
                    'name': src_name,
                    'status': st_val,
                    'fix_version': st.get('description') or ''
                })

# 檢查本機實際安裝了哪些受影響來源套件的二進位套件
installed_affected = []
for item in affected_sources:
    src_name = item['name']
    matched_bins = source_to_bins.get(src_name) or []
    if not matched_bins and src_name in installed_binaries:
        matched_bins = [(src_name, installed_binaries[src_name][0])]
    if matched_bins:
        installed_affected.append((item, matched_bins))

# 狀況 1：本機未安裝任何相關來源套件
if not installed_affected:
    print("本機未安裝任何受影響的來源套件（Source Package）。")
    print("")
    print("✔ {} 不影響您的系統。".format(cve_id))
    sys.exit(0)

# 狀況 2：本機已安裝受影響套件
total_installed = len(installed_affected)
src_names_str = ", ".join([item['name'] for item, _ in installed_affected])
if total_installed == 1:
    print("本機已安裝 1 個受影響的來源套件: {}".format(src_names_str))
else:
    print("本機已安裝 {} 個受影響的來源套件: {}".format(total_installed, src_names_str))

all_resolved = True
still_affected_sources = []
needs_upgrade_bins = []
needs_esm = False

for idx, (item, matched_bins) in enumerate(installed_affected, 1):
    src_name = item['name']
    st = item['status'].lower()
    fix_ver = item['fix_version'] or ""
    print("({}/{}) {}:".format(idx, total_installed, src_name))
    
    is_esm = ("esm" in fix_ver.lower()) or (codename in ["trusty", "precise", "xenial", "bionic"])
    if is_esm:
        repo_desc = "Ubuntu Pro (ESM-Infra) 專屬套件庫"
    else:
        repo_desc = "Ubuntu 標準更新套件庫"

    if st == "released":
        is_pkg_vulnerable = False
        for b_name, b_ver in matched_bins:
            if fix_ver:
                try:
                    cmp_res = subprocess.call(["dpkg", "--compare-versions", b_ver, "lt", fix_ver])
                    if cmp_res == 0:
                        is_pkg_vulnerable = True
                        needs_upgrade_bins.append(b_name)
                except Exception:
                    if b_ver != fix_ver:
                        is_pkg_vulnerable = True
                        needs_upgrade_bins.append(b_name)
            else:
                is_pkg_vulnerable = True
                needs_upgrade_bins.append(b_name)

        if is_pkg_vulnerable:
            all_resolved = False
            still_affected_sources.append(src_name)
            if is_esm:
                needs_esm = True
            print("官方修復已於 {} 中提供。".format(repo_desc))
            if fix_ver:
                print("官方目標修復版號: {}".format(fix_ver))
            print("該安全更新尚未安裝。目前本機安裝之套件:")
            for b_name, b_ver in matched_bins:
                print("  - {} ({})".format(b_name, b_ver))
        else:
            print("官方修復已於 {} 中提供。".format(repo_desc))
            print("該安全更新已安裝於本機。目前安裝之套件:")
            for b_name, b_ver in matched_bins:
                print("  - {} ({})".format(b_name, b_ver))

    elif st in ["needs-triage", "needs-evaluation", "pending", "active"]:
        all_resolved = False
        still_affected_sources.append(src_name)
        print("Ubuntu 資安工程師目前正在調查此漏洞。")
    elif st == "needed":
        all_resolved = False
        still_affected_sources.append(src_name)
        print("官方確認受此漏洞影響，目前修復套件仍在製作中（尚未釋出）。")
    elif st == "deferred":
        all_resolved = False
        still_affected_sources.append(src_name)
        print("Ubuntu 資安工程師已將此漏洞評估暫緩處理。")
    elif st == "ignored":
        all_resolved = False
        still_affected_sources.append(src_name)
        print("Ubuntu 資安工程師目前不打算針對此漏洞進行修復（已忽略/不予修復）。")
    else:
        all_resolved = False
        still_affected_sources.append(src_name)
        print("官方狀態: {}（尚未確認修復）".format(st))

    print("")

if all_resolved:
    print("✔ {} 已修復完畢。".format(cve_id))
    sys.exit(0)
else:
    aff_count = len(still_affected_sources)
    aff_str = ", ".join(still_affected_sources)
    if aff_count == 1:
        print("仍有 1 個套件受此漏洞影響: {}".format(aff_str))
    else:
        print("仍有 {} 個套件受此漏洞影響: {}".format(aff_count, aff_str))

    if needs_upgrade_bins:
        bins_cmd = " ".join(sorted(set(needs_upgrade_bins)))
        print("")
        print("若要在 Ubuntu {} 上套用修復，請依序執行:".format(codename))
        if needs_esm:
            print("  sudo ua enable esm-infra")
        print("  sudo apt-get update")
        print("  sudo apt install --only-upgrade {}".format(bins_cmd))

    print("")
    print("✘ {} 尚未修復。".format(cve_id))
    sys.exit(2)

EOF
}

# 7. 遍歷 CVE 清單逐筆診斷
TOTAL_CVES=${#CVE_LIST[@]}
RESOLVED_COUNT=0
VULNERABLE_COUNT=0
ERROR_COUNT=0

for idx in "${!CVE_LIST[@]}"; do
  RAW_ARG="${CVE_LIST[$idx]}"
  NUM=$((idx + 1))

  # 正規化 CVE 編號格式
  RAW_INPUT=$(echo "$RAW_ARG" | tr '[:lower:]' '[:upper:]')
  if [[ "$RAW_INPUT" =~ ^CVE- ]]; then
    CVE_ID="$RAW_INPUT"
  else
    CVE_ID="CVE-$RAW_INPUT"
  fi

  if [ "$TOTAL_CVES" -gt 1 ]; then
    echo "================================================================================"
    echo "[$NUM/$TOTAL_CVES] 正在檢測: $CVE_ID"
    echo "================================================================================"
  fi

  API_URL="https://ubuntu.com/security/cves/${CVE_ID}.json"
  JSON_FILE=$(mktemp /tmp/profix_XXXXXX.json 2>/dev/null || echo "/tmp/profix_${CVE_ID}_$$.json")

  if [ "$HTTP_TOOL" = "curl" ]; then
    curl -sSL --connect-timeout 10 "$API_URL" -o "$JSON_FILE" 2>/dev/null
  elif [ "$HTTP_TOOL" = "wget" ]; then
    wget -qO "$JSON_FILE" --timeout=10 "$API_URL" 2>/dev/null
  fi

  if [ ! -s "$JSON_FILE" ]; then
    echo "錯誤：無法自 Canonical 官方安全資料庫取得 ${CVE_ID} 資料，請檢查網路連線或編號。"
    rm -f "$JSON_FILE"
    ERROR_COUNT=$((ERROR_COUNT + 1))
  else
    run_diagnosis "$JSON_FILE" "$CODENAME" "$DRY_RUN"
    PY_STATUS=$?
    rm -f "$JSON_FILE"

    if [ $PY_STATUS -eq 0 ]; then
      RESOLVED_COUNT=$((RESOLVED_COUNT + 1))
    elif [ $PY_STATUS -eq 2 ]; then
      VULNERABLE_COUNT=$((VULNERABLE_COUNT + 1))
    else
      ERROR_COUNT=$((ERROR_COUNT + 1))
    fi
  fi

  # 若為多筆查詢，在各筆之間加入微幅間隔（0.3 秒），降低 API 限流風險
  if [ "$TOTAL_CVES" -gt 1 ] && [ "$NUM" -lt "$TOTAL_CVES" ]; then
    echo ""
    sleep 0.3
  fi
done

# 8. 若為多筆查詢，最後輸出總結摘要
if [ "$TOTAL_CVES" -gt 1 ]; then
  echo ""
  echo "================================================================================"
  echo "【診斷總結摘要】共檢查 $TOTAL_CVES 筆 CVE"
  echo "================================================================================"
  echo "  ✔ 安全 / 已修復完畢：$RESOLVED_COUNT 筆"
  [ $VULNERABLE_COUNT -gt 0 ] && echo "  ✘ 尚未修復（需更新）：$VULNERABLE_COUNT 筆"
  [ $ERROR_COUNT -gt 0 ] && echo "  ⚠ 查無資料 / 執行異常：$ERROR_COUNT 筆"
  echo "================================================================================"
fi
