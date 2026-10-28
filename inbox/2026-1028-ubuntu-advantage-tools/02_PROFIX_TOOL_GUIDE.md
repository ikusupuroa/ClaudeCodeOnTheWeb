# profix.sh — Ubuntu 舊版 CVE 快速診斷工具使用指南

---

## 一、為什麼要開發 profix.sh？(Background & Motivation)

### 1. 舊版發行版缺乏官方 `pro fix` 的核心痛點
在現代 Ubuntu（20.04 LTS、22.04 LTS、24.04 LTS+）中，Canonical 官方提供的 `ubuntu-pro-client` 具備強大的 `pro fix <CVE-編號>` 指令，系統管理員能在命令列終端機中，一秒釐清某個 CVE 漏洞是否影響本機、官方是否已釋出修復、修復套件名稱與目標版號，並可一鍵取得修補指引。

然而，在許多長青維運的舊版系統中（最典型者為 **Ubuntu 14.04 LTS Trusty Tahr**）：
- 系統僅內建早期版本的 `ubuntu-advantage-tools`（指令為 `ua`，多為 19.x 或更早版本）。
- 官方**從未將包含 `pro fix` 功能的現代 Pro Client 回移植（backport）至 Ubuntu 14.04**。
- 舊版 `ua` 工具僅支援訂閱附掛（attach）與基本服務啟用（如 `ua enable esm-infra`），**完全沒有單筆 CVE 的診斷與驗證機制**。

### 2. 傳統人工排查的低效與高風險
在缺乏 `pro fix` 的情況下，資安稽核要求排查特定重大 CVE 時，維運人員必須被迫採用極為繁瑣的人工流程：
1. 開啟瀏覽器或以 `curl` 連至 Canonical 官方資安公告網頁搜尋該 CVE。
2. 在龐大的 JSON 或 HTML 中搜尋目標發行版代號（如 `trusty`）對應的來源套件（Source Package）名稱與目標修補版號。
3. 登入主機透過 `dpkg -l` 查詢本機實際安裝的二進位套件（Binary Package）名稱與現行版本。
4. 人工肉眼比對版號字串——由於 Debian/Ubuntu 的版號規格包含 epoch（紀元，如 `1:`）、上游版號、Debian 修訂版號與 Ubuntu 特有修補版號（如 `1.4ubuntu1.1+esm1`），單純字串比對極易發生人為誤判。

### 3. 工具誕生定位
為了解決上述痛點，本專案開發了 [`profix.sh`](file:///Users/chenjunyu/Documents/Antigravity/Ubuntu%20Pro/UbuntuCVEs/profix.sh)。它是一支**專為 Ubuntu 14.04 及各類舊版 / 輕量環境打造的獨立命令列診斷工具**：
- **體驗對齊**：100% 模擬現代官方 `pro fix` 的回饋排版與診斷語意，以清楚的繁體中文呈現。
- **即時連線**：直連 Canonical 官方公開資安 REST API，取得權威性漏洞資訊。
- **精準比對**：由本機 `/var/lib/dpkg/status` 動態解析來源套件關聯，並透過系統原生 `dpkg --compare-versions` 判定版號，杜絕誤判。
- **精準指引**：自動生成包含 `--only-upgrade` 的精確修復指令，避免全系統升級引發非預期停機或相依性衝突。

---

## 二、使用先決條件與情境限制 (Prerequisites & Constraints)

### 1. 先決條件 (Prerequisites)
`profix.sh` 採極簡與零第三方依賴設計，只要受測環境符合以下基本要求即可直接執行：

1. **網路連線能力**：
   - 受測主機能連線至 Canonical 官方資安 API：`https://ubuntu.com/security/cves/<CVE>.json`（通訊埠 Port 443 HTTPS）。
2. **HTTP 下載工具**：
   - 系統已安裝 `curl` 或 `wget`（腳本會自動偵測並選用可用者）。
3. **Python 直譯器**：
   - 系統存在 `python3` 或 `python`（Python 2.7+ 均相容）。僅使用標準函式庫（`json`、`sys`、`subprocess`、`io`），無須安裝任何 pip 套件。
4. **Debian 套件管理基底**：
   - 具備 `dpkg` 與 `/var/lib/dpkg/status` 檔案（Ubuntu 系統預設皆已具備，一般使用者權限即可唯讀存取）。

### 2. 情境限制與注意事項 (Situational Constraints)

> [!WARNING]
> **重要限制與資安邊界**
>
> 1. **僅限官方來源套件**：
>    `profix.sh` 是以 Canonical 官方資安資料庫為比對依據。非經由 Ubuntu 官方套件庫安裝之軟體（例如自行從原始碼編譯 `make install`、第三方 PPA、獨立下載的 `.deb` 檔或非官方容器內部的二進位檔），無法透過此工具診斷。
> 2. **純唯讀檢查工具，不自動更改系統**：
>    腳本只負責比對與給予建議，**不會私自變更系統狀態或主動升級套件**。若需套用修復，請手動複製腳本最後產出的修補指令執行。
> 3. **ESM 授權與套件庫相依**：
>    若診斷結果顯示修補位於 `Ubuntu Pro (ESM-Infra) 專屬套件庫`，本機必須已綁定有效的 ESM 授權（如執行 `sudo ua attach <Token>` 並啟用 `esm-infra`），後續執行 `apt-get install` 才能成功下載該修補套件。
> 4. **API 查詢頻率與安全上限（30 筆）**：
>    本工具支援以空格分隔一口氣傳入多筆 CVE。為避免短時間密集連線觸發 Canonical 官方資安 API 限流（Rate Limit），腳本內建單次查詢安全上限為 **30 筆**，且每筆查詢之間會自動加入微小間隔保護網路狀態。若超過上限，腳本會提示中斷並建議分批執行。

---

## 三、使用方式與語法 (Usage & Syntax)

### 1. 檔案位置與執行權限
確保腳本具備執行權限（或直接使用 `bash` 調用）：
```bash
# 賦予執行權限
chmod +x profix.sh
```

### 2. 基本語法
支援單筆或以空格分隔一口氣傳入多筆 CVE，且 `--dry-run` 放置前後均可：
```bash
# 單筆 CVE 診斷
bash profix.sh <CVE-編號>

# 多筆 CVE 批次診斷（以空格分隔）
bash profix.sh <CVE-1> <CVE-2> <CVE-3> ...

# 模擬執行模式（對齊官方 pro fix --dry-run 行為，支援單筆與多筆）
bash profix.sh --dry-run <CVE-1> <CVE-2>
bash profix.sh <CVE-1> <CVE-2> --dry-run
```

> [!NOTE]
> **單次輸入上限說明**：
> 單次指令最多支援輸入 **30 個** CVE 編號（超過將主動中斷並提示分批執行）。當輸入 2 筆以上時，終端機將依序排查每筆漏洞，並於最後自動產出整體的「診斷總結摘要」。

### 3. CVE 編號格式彈性支援
腳本內建正規化防呆機制，下列寫法均能自動識別並轉為標準大寫 `CVE-YYYY-NNNNN`：
- `CVE-2026-109618`
- `cve-2026-109618`
- `2026-109618`

---

## 四、診斷流程與底層比對架構 (Architecture)

```mermaid
flowchart TD
    A["輸入 CVE 編號 (如 CVE-2026-109618)"] --> B["自動偵測 OS 發行代號 (如 trusty)"]
    B --> C["HTTP GET 直連 Canonical 官方 API (/cves/CVE-xxxx.json)"]
    C --> D{"查詢成功?"}
    D -- 否 --> E["提示錯誤：查無此 CVE 或連線逾時"]
    D -- 是 --> F["讀取本機 /var/lib/dpkg/status"]
    F --> G["建立 Source Package 與 Binary Package 映射表"]
    G --> H{"本機是否安裝此 Source Package 下的任一套件?"}
    H -- 否 --> I["✔ 判定：本機未安裝，不受此漏洞影響"]
    H -- 是 --> J["提取官方針對 trusty 之修復狀態與目標版本"]
    J --> K{"官方狀態判定"}
    K -- "released (已釋出)" --> L["呼叫 dpkg --compare-versions 比對版號"]
    L -- 本機版號 >= 目標版號 --> M["✔ 判定：安全更新已安裝於本機"]
    L -- 本機版號 < 目標版號 --> N["✘ 判定：尚未修復，產生精準修補指令建議"]
    K -- "needs-triage / needed / deferred" --> O["說明官方目前進度（評估中 / 暫緩 / 製作中）"]
```

---

## 五、執行範例與輸出解析 (Examples & Walkthrough)

### 範例 1：本機未受影響（未安裝該套件）
當本機根本未安裝該漏洞所牽涉的套件時，工具會立即回報安全並結案：

```bash
bash profix.sh CVE-2026-8376
```

**輸出結果**：
```text
CVE-2026-8376: perl 安全漏洞
 - https://ubuntu.com/security/CVE-2026-8376

本機未安裝任何受影響的來源套件（Source Package）。

✔ CVE-2026-8376 不影響您的系統。
```

---

### 範例 2：已安裝套件且受漏洞影響（需修補）
以 Ubuntu 14.04 上的重大 PHP 遠端程式碼執行漏洞（CVE-2026-109618，PHP2Shell）為例，本機安裝了舊版 `php5`：

```bash
bash profix.sh CVE-2026-109618
```

**輸出結果**：
```text
CVE-2026-109618: PHP2Shell OOM Memory Corruption Vulnerability
 - https://ubuntu.com/security/CVE-2026-109618
 - 官方安全公告: USN-7201-1, USN-7201-2

本機已安裝 1 個受影響的來源套件: php5
(1/1) php5:
官方修復已於 Ubuntu Pro (ESM-Infra) 專屬套件庫 中提供。
官方目標修復版號: 5.5.9+dfsg-1ubuntu4.29+esm4
該安全更新尚未安裝。目前本機安裝之套件:
  - php5-cli (5.5.9+dfsg-1ubuntu4.29+esm2)
  - php5-common (5.5.9+dfsg-1ubuntu4.29+esm2)
  - php5-fpm (5.5.9+dfsg-1ubuntu4.29+esm2)

仍有 1 個套件受此漏洞影響: php5

若要在 Ubuntu trusty 上套用修復，請依序執行:
  sudo ua enable esm-infra
  sudo apt-get update
  sudo apt install --only-upgrade php5-cli php5-common php5-fpm

✘ CVE-2026-109618 尚未修復。
```

> [!TIP]
> **修補指令亮點**：
> 輸出最後會明確列出 `sudo apt install --only-upgrade php5-cli php5-common php5-fpm`。維運人員只需複製貼上該指令，即可精準升級受影響套件，不會意外更動主機上的其他服務！

---

### 範例 3：修補已安裝完成（覆核驗證結案）
當依照指引完成指定套件升級後，再次執行 `profix.sh` 進行覆核：

```bash
bash profix.sh CVE-2026-109618
```

**輸出結果**：
```text
CVE-2026-109618: PHP2Shell OOM Memory Corruption Vulnerability
 - https://ubuntu.com/security/CVE-2026-109618
 - 官方安全公告: USN-7201-1, USN-7201-2

本機已安裝 1 個受影響的來源套件: php5
(1/1) php5:
官方修復已於 Ubuntu Pro (ESM-Infra) 專屬套件庫 中提供。
該安全更新已安裝於本機。目前安裝之套件:
  - php5-cli (5.5.9+dfsg-1ubuntu4.29+esm4)
  - php5-common (5.5.9+dfsg-1ubuntu4.29+esm4)
  - php5-fpm (5.5.9+dfsg-1ubuntu4.29+esm4)

✔ CVE-2026-109618 已修復完畢。
```

此文字輸出可直接截圖或存檔，作為向企業資安稽核單位申請「已修復結案」的官方佐證。

---

### 範例 4：使用 `--dry-run` 模擬模式
若帶有 `--dry-run` 參數，頂部會顯示提示訊息，確保與現代 `pro fix --dry-run` 體驗一致：

```bash
bash profix.sh --dry-run CVE-2026-109619
```

**輸出結果**：
```text
警告：目前正使用 --dry-run 模擬執行模式。
執行此指令時不會安裝或變更系統上的任何套件。
CVE-2026-109619: PHP2Shell Worker Global State Residue Vulnerability
 - https://ubuntu.com/security/CVE-2026-109619
...
```

---

### 範例 5：官方尚在評估中或尚未釋出修補
若遇到較新或官方尚未釋出補丁的 CVE：

```text
CVE-2026-XXXXX: Sample Package Vulnerability
 - https://ubuntu.com/security/CVE-2026-XXXXX

本機已安裝 1 個受影響的來源套件: libssl
(1/1) libssl:
Ubuntu 資安工程師目前正在調查此漏洞。

仍有 1 個套件受此漏洞影響: libssl

✘ CVE-2026-XXXXX 尚未修復。
```

---

### 範例 6：一次輸入多筆 CVE 批次診斷（含總結摘要）
在單一指令中一口氣輸入多筆 CVE，腳本會依序診斷並在最下方輸出統整摘要：

```bash
bash profix.sh --dry-run CVE-2026-109618 CVE-2026-109619 CVE-2026-8376
```

**輸出結果**：
```text
警告：目前正使用 --dry-run 模擬執行模式。
執行此指令時不會安裝或變更系統上的任何套件。

================================================================================
[1/3] 正在檢測: CVE-2026-109618
================================================================================
CVE-2026-109618: PHP2Shell OOM Memory Corruption Vulnerability
 - https://ubuntu.com/security/CVE-2026-109618
 - 官方安全公告: USN-7201-1, USN-7201-2

本機已安裝 1 個受影響的來源套件: php5
(1/1) php5:
官方修復已於 Ubuntu Pro (ESM-Infra) 專屬套件庫 中提供。
該安全更新已安裝於本機。目前安裝之套件:
  - php5-cli (5.5.9+dfsg-1ubuntu4.29+esm4)

✔ CVE-2026-109618 已修復完畢。

================================================================================
[2/3] 正在檢測: CVE-2026-109619
================================================================================
CVE-2026-109619: PHP2Shell Worker Global State Residue Vulnerability
 - https://ubuntu.com/security/CVE-2026-109619
 - 官方安全公告: USN-7201-1, USN-7201-2

本機已安裝 1 個受影響的來源套件: php5
(1/1) php5:
官方修復已於 Ubuntu Pro (ESM-Infra) 專屬套件庫 中提供。
該安全更新尚未安裝。目前本機安裝之套件:
  - php5-cli (5.5.9+dfsg-1ubuntu4.29+esm2)

仍有 1 個套件受此漏洞影響: php5

若要在 Ubuntu trusty 上套用修復，請依序執行:
  sudo ua enable esm-infra
  sudo apt-get update
  sudo apt install --only-upgrade php5-cli

✘ CVE-2026-109619 尚未修復。

================================================================================
[3/3] 正在檢測: CVE-2026-8376
================================================================================
CVE-2026-8376: perl 安全漏洞
 - https://ubuntu.com/security/CVE-2026-8376

本機未安裝任何受影響的來源套件（Source Package）。

✔ CVE-2026-8376 不影響您的系統。

================================================================================
【診斷總結摘要】共檢查 3 筆 CVE
================================================================================
  ✔ 安全 / 已修復完畢：2 筆
  ✘ 尚未修復（需更新）：1 筆
================================================================================
```
