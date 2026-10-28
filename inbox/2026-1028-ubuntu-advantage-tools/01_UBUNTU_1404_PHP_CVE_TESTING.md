# Ubuntu 14.04 PHP CVE 弱點驗證與 Ubuntu Advantage 修復測試指南

> **僅供學習參考、使用風險自負。本文件為個人學習與排查測試紀錄，非 Canonical 官方文件。**

---

## 一、情境與背景說明 (Overview & Background)

本文件紀錄針對已終止標準支援（End-of-Life, EOL）的舊版作業系統進行 CVE（Common Vulnerabilities and Exposures，通用弱點與漏洞）排查與修復測試之流程。

* **測試對象**：Ubuntu 14.04 LTS (Trusty Tahr)，其標準 5 年公用安全性維護已於 2019 年 4 月結束。
* **測試漏洞標的**：影響廣泛的 PHP 遠端程式碼執行（RCE，資安界代號 **PHP2Shell**，相關報導請見 [iThome 新聞：PHP重大漏洞PHP2Shell恐導致RCE](https://www.ithome.com.tw/news/179870)）雙漏洞：
  * [CVE-2026-109618](https://ubuntu.com/security/CVE-2026-109618)：PHP2Shell OOM 記憶體毀損漏洞（CVSS 9.8 / Critical）。
  * [CVE-2026-109619](https://ubuntu.com/security/CVE-2026-109619)：PHP2Shell Worker 全域狀態殘留漏洞（CVSS 9.8 / Critical）。
* **核心測試目標**：
  1. 建立輕量且隔離的測試沙盒環境（Testbed）。
  2. 部署 Ubuntu Advantage 用戶端與目標測試套件（PHP5）。
  3. 檢視系統生命週期狀態，並運用兩大標準途徑比對特定 CVE 弱點的受影響狀況。
  4. 整理透過 ESM 進行指定套件精準修補（`--only-upgrade`）的標準作業程序與相依性排查方法。

---

## 二、第一步：建立隔離測試環境 (Setup Isolated Testbed Environment)

為避免測試干擾主機或其他服務，推薦透過 LXD 系統容器拉起獨立的 Ubuntu 14.04 測試沙盒實例（命名為 `trusty-cve`）。

### 1. 建立並啟動測試容器
在宿主機（Host）執行以下指令：

```bash
# 從 Canonical 官方映像倉庫拉取並啟動 Ubuntu 14.04 容器
lxc launch ubuntu:14.04 trusty-cve
```

### 2. 確認網路與狀態
```bash
lxc list trusty-cve
```
確認狀態為 `RUNNING` 且已取得 IPv4 位址（若 IPv4 欄位為空，請確認宿主機防火牆已放行 `lxdbr0` 相關轉發）。

### 3. 進入測試容器終端機
```bash
lxc shell trusty-cve
```
進入容器後，確認作業系統版本：
```bash
lsb_release -a
```
輸出確認為 `Ubuntu 14.04.6 LTS (trusty)`。

---

## 三、第二步：官方套件庫支援特性與更新 (Official Repositories & Update)

> [!NOTE]
> **特性說明：Ubuntu LTS 官方套件庫保留機制**
>
> 雖然一般的非 LTS 舊發行版（如 14.10、15.04 等）在生命週期結束後會被下線並移至 `old-releases.ubuntu.com`，但 **Ubuntu LTS（長期支援版，如 14.04 Trusty Tahr）** 因享有 Canonical **Ubuntu Pro / ESM（Extended Security Maintenance）** 的支援，官方依然保留了 `archive.ubuntu.com` 與 `security.ubuntu.com` 的套件樹。
> 
> 在官方提供的 Ubuntu 14.04 映像檔中，預設的 `/etc/apt/sources.list` 已經指向標準鏡像站，無須手動置換至 `old-releases`，維持預設即可直接更新。

在未綁定任何 Pro 授權的初始容器終端機內，執行標準更新指令：

```bash
sudo apt-get update
```

**實機輸出範例（未綁定 Pro 授權）**：
```text
Hit http://archive.ubuntu.com trusty InRelease
Hit http://archive.ubuntu.com trusty-updates InRelease
Hit http://security.ubuntu.com trusty-security InRelease
Reading package lists... Done
```
*(說明：未綁定授權前，更新來源僅包含官方公開標準更新站台，不會包含 `esm.ubuntu.com`)*。

---

## 四、第三步：部署 Ubuntu Advantage 工具與 PHP 測試標的 (Deploy UA Client & Target Package)

更新完套件清單後，即可安裝 Canonical 官方弱點維護工具與目標測試套件。

### 1. 安裝與設定 Ubuntu Advantage 用戶端
Ubuntu 14.04 中的管理套件名稱為 `ubuntu-advantage-tools`：

```bash
# 安裝工具套件
sudo apt-get install -y ubuntu-advantage-tools
```

安裝完成後，系統會提供 CLI 工具：
* 主要指令：`ubuntu-advantage`
* 簡寫指令：`ua`
* （註：現代 Ubuntu 的 `pro` 指令在 19.7 版中尚未引進，在 14.04 中請統一使用 `ua`）。

檢查工具版本：
```bash
ua version
```
*(實機輸出版本為 `19.7ubuntu0.2`)*

---

### 2. 安裝 PHP5 測試套件
在 Ubuntu 14.04 中，預設官方套件庫提供的 PHP 主版本為 **PHP 5.5**（套件名稱為 `php5`）：

```bash
# 安裝 PHP5 核心與 CLI 套件
sudo apt-get install -y php5 php5-cli php5-common

# 檢查安裝之 PHP 版本
php -v
```

**實機輸出範例**：
```text
PHP 5.5.9-1ubuntu4.29 (cli) (built: Apr 22 2019 18:33:52) 
Copyright (c) 1997-2014 The PHP Group
Zend Engine v2.5.0, Copyright (c) 1998-2014 Zend Technologies
    with Zend OPcache v7.0.3, Copyright (c) 1999-2014, by Zend Technologies
```

> [!NOTE]
> **版本號說明：`5.5.9-1ubuntu4.29` 是標準公用維護的最終版本（Baseline）**
>
> 1. **編譯時間點**：輸出中的編譯時間 `Apr 22 2019 18:33:52`，正是 Ubuntu 14.04 五年標準支援到期（2019 年 4 月）當月所發布的最後一個公用版本。
> 2. **版號顯示格式差異**：`php -v` 輸出顯示為 `5.5.9-1ubuntu4.29`，而 `dpkg -l` 顯示為 `5.5.9+dfsg-1ubuntu4.29`。兩者為同一個版本，`+dfsg` 是 Debian/Ubuntu 針對上游原始碼套件符合《Debian 自由軟體指引》（DFSG）時重新打包的標記，PHP 執行檔本身輸出則為上游版號字串。
> 3. 在 2019 年 5 月之後揭露的新漏洞（例如 PHP2Shell 雙漏洞），官方修補套件均標註為 `+esm` 後綴（目前最新修復版號為 `5.5.9+dfsg-1ubuntu4.29+esm18`），發布於 Pro 套件庫。

---

## 五、第四步：系統安全性健檢與 CVE 漏洞測試實務 (Security Audit & CVE Testing)

> [!IMPORTANT]
> **版本差異說明：Ubuntu 14.04 之 `ubuntu-advantage-tools` 限制**
>
> 在較新的 Ubuntu 版本（16.04+ / 20.04+）中，`ubuntu-advantage-tools` 已升級至 v27+，提供 `ua fix <CVE>` 與 `ua security-status` 等自動化指令。
> 然而，**在 Ubuntu 14.04 (Trusty Tahr) 中，官方維護之最新版本固定為 `19.7`（例如 `19.7ubuntu0.2`）**。
>
> 執行 `ua --help` 可見 19.7 支援的子命令僅限於：
> `status`、`attach`、`detach`、`enable`、`disable`、`refresh`、`version`、`help`
> 若執行 `ua security-status` 或 `ua fix` 會直接報錯：`invalid choice`。
> 因此在 14.04 中，需依循以下方式檢視狀態與查詢 CVE 漏洞。

---

### 1. 檢視 Ubuntu Advantage 與系統支援狀態 (Check Status)

#### A. 檢視 Pro / ESM 訂閱與服務啟用狀態
透過 `sudo ua status` 指令，可檢視目前系統關聯的合約與模組狀態：

```bash
sudo ua status
```

**實機輸出範例（未綁定狀態）**：
```text
SERVICE           AVAILABLE  DESCRIPTION
cc-eal            no         Common Criteria EAL2 Provisioning Packages
esm-infra         yes        UA Infra: Extended Security Maintenance
esm-infra-legacy  yes        Expanded Security Maintenance for Infrastructure on Legacy Instances
fips              no         NIST-certified FIPS modules
fips-updates      no         Uncertified security updates to FIPS modules
livepatch         yes        Canonical Livepatch service

This machine is not attached to a UA subscription.
See https://ubuntu.com/advantage
```
* **SERVICE**：各項維護模組。
* **AVAILABLE**：該服務是否適用於當前架構（在 14.04 上，`esm-infra` 與 `esm-infra-legacy` 均標記為 `yes`，代表 `ua 19.7` 支援此兩項服務）。
* **狀態提示**：未關聯帳號時，會提示 `This machine is not attached to a UA subscription.`。

#### B. 檢視全系統套件支援生命週期報告
Ubuntu 14.04 內建的系統級套件審查工具為 `ubuntu-support-status`：

```bash
ubuntu-support-status
```

**實機輸出範例**：
```text
Support status summary of 'phptest':

You have 0 packages (0.0%) that can not/no-longer be downloaded
You have 448 packages (100.0%) that are unsupported

Run with --show-unsupported, --show-supported or --show-all to see more details
```
* **分析**：
  * **100% 套件（全數 448 個）均標示為 `unsupported`**：因 Ubuntu 14.04 標準支援終止日（2019 年 4 月）已過，系統判定當前所有安裝之套件已失去公用安全性支援。

---

### 2. 在 Ubuntu 14.04 查詢 CVE 漏洞的兩大標準途徑 (Query CVE Methods)

因為 `19.7` 版尚未內建 `ua fix` 命令，針對已安裝套件（例如 `php5`）查詢特定重大 CVE 漏洞時，可採用以下標準方式：

#### 途徑 1：透過 APT 本地套件 Changelog 查詢已修補的 CVE（免網路／本機即時）
Ubuntu 在維護每個安全性修補時，都會在 package changelog 中記錄對應的 CVE 編號與 USN 安全公告。

```bash
# 檢查本地 php5 套件 changelog 是否包含 CVE-2026-109618 修補紀錄
sudo apt-get changelog php5 | grep -i "CVE-2026-109618" -B 2 -A 5

# 檢查本地 php5 套件 changelog 是否包含 CVE-2026-109619 修補紀錄
sudo apt-get changelog php5 | grep -i "CVE-2026-109619" -B 2 -A 5
```
或直接解壓縮閱讀本地安裝之 Debian 更新紀錄：
```bash
zcat /usr/share/doc/php5-common/changelog.Debian.gz | grep -E "CVE-2026-109618|CVE-2026-109619" -B 2 -A 5
```
* **判定原則**：若 grep 無任何輸出，代表目前安裝之版本（`5.5.9-1ubuntu4.29`）尚未包含後續揭露的漏洞修護。

---

#### 途徑 2：透過 Canonical 官方 CVE Tracker REST API（官方權威查證，推薦）
Canonical 官方資安團隊為 Ubuntu 每個發行版（包含 Trusty）維護了公開的 CVE JSON API，能即刻查詢特定 CVE 在 Ubuntu 14.04 的修復狀態、所屬套件庫（pocket）與版本：

```bash
# 1. 安裝輕量查詢工具 curl 與 jq
sudo apt-get install -y curl jq

# 2. 查詢 CVE-2026-109618 在 trusty 上的 php5 修復詳情
curl -s "https://ubuntu.com/security/cves/CVE-2026-109618.json" | \
  jq '.packages[] | select(.name=="php5") | {package: .name, status: .statuses[] | select(.release_codename=="trusty")}'
```

**回傳結果結構**：
```json
{
  "package": "php5",
  "status": {
    "release_codename": "trusty",
    "status": "released",
    "pocket": "esm-infra-legacy",
    "description": "5.5.9+dfsg-1ubuntu4.29+esm18"
  }
}
```

* **分析**：
  * **所屬套件庫（Pocket）**：官方資料明確標註為 `esm-infra-legacy`（而非標準更新或一般的 esm-infra）。這是 Canonical 為超出標準 ESM 維護期之舊版本提供的 Legacy Support 專屬通道。
  * **官方修補版號**：最新修復版號為 `5.5.9+dfsg-1ubuntu4.29+esm18`，對應官方安全性公告 `USN-8948-2`。
  * **本機狀態對照**：比對本機安裝之版本 `5.5.9+dfsg-1ubuntu4.29`，可確認本機安裝版號低於修補版號，處於未修復狀態。

---

### 3. 綁定 Ubuntu Pro Token 並套用修復更新 (Attach & Upgrade)

> [!NOTE]
> **未實測說明（沒有 Pro 授權）**：
> 本小節之 `attach`、`enable`、`apt-get update`（ESM 部分）與實際套件升級步驟，因測試環境未具備有效的 Ubuntu Pro / Legacy 訂閱授權，**未於實機完成升級驗證**。以下步驟與輸出為依據官方規範與相依性結構推演之「預期步驟與預期結果」。

#### A. 啟用 Legacy 套件庫流程（預期步驟）
若持有合法之 Ubuntu Pro 授權且包含 Legacy 支援：

```bash
# 1. 綁定 Token
sudo ua attach <YOUR_PRO_TOKEN>

# 2. 啟用 Legacy 專屬套件庫 (ua 19.7 支援此指令)
sudo ua enable esm-infra-legacy

# 3. 確認服務啟用狀態
sudo ua status

# 4. 更新套件清單快取（此時會成功抓取 esm.ubuntu.com 的 InRelease）
sudo apt-get update
```

#### B. 正確的套件升級做法：處理 php5 Metapackage 相依性

> [!IMPORTANT]
> **為什麼不建議單純執行 `sudo apt install --only-upgrade php5`？**
>
> 1. **`php5` 是 Metapackage（元套件）**：
>    在 Ubuntu 14.04 中，`php5` 本身是一個只負責相依性宣告的空殼套件。透過 `apt-cache show php5` 可見其相依性為：
>    `Depends: libapache2-mod-php5 (>= 5.5.9+dfsg-1ubuntu4.29) | ... | php5-fpm (>= ...), php5-common (>= ...)`
>    若系統當初僅安裝了 `php5-cli` 與 `php5-common`，本機根本沒有安裝 `php5` 元套件本身；此時若直接下達 `apt install --only-upgrade php5`，`--only-upgrade` 會因為本機無 `php5` 而直接略過，導致核心的 `php5-cli` 完全沒被升級！
> 2. **精準全套件升級解法**：
>    應先檢索本機已安裝且來源套件（Source Package）為 `php5` 的所有二進位套件清單，再將清單一併傳入 `--only-upgrade`：

```bash
# 步驟 1：查詢本機已安裝且來源套件為 php5 的二進位套件清單
dpkg-query -W -f='${Package}\t${Source}\t${Status}\n' | awk -F'\t' '($2 ~ /^php5( |$)/ || $1=="php5") && $3 ~ /installed/ {print $1}'
```
*實機執行輸出範例*：
```text
php5-cli
php5-common
php5-readline
```

```bash
# 步驟 2：將查詢到的套件一併傳入執行精準升級（預期指令）
sudo apt install --only-upgrade $(dpkg-query -W -f='${Package}\t${Source}\t${Status}\n' | awk -F'\t' '($2 ~ /^php5( |$)/ || $1=="php5") && $3 ~ /installed/ {print $1}')

# 或手動明確指定套件名稱：
sudo apt install --only-upgrade php5-cli php5-common php5-readline
```

#### C. 升級後驗證（預期結果，未實測）
完成修補套件升級後，預期透過 `dpkg` 檢視應套用至最新修補版號：

```bash
dpkg -l php5-cli php5-common php5-readline
```

**預期輸出結果**：
```text
ii  php5-cli        5.5.9+dfsg-1ubuntu4.29+esm18  amd64  command-line interpreter for the php5 scripting language
ii  php5-common     5.5.9+dfsg-1ubuntu4.29+esm18  amd64  Common files for packages built from the php5 source
ii  php5-readline   5.5.9+dfsg-1ubuntu4.29+esm18  amd64  readline module for php5
```

---

## 六、常用指令與排錯速查表 (Quick Reference)

| 操作目標 | 容器內執行指令 | 說明 |
| :--- | :--- | :--- |
| **更新套件庫清單** | `sudo apt-get update` | LTS 版官方保留 archive 來源，未綁定前僅更新公用標準庫 |
| **安裝 UA 工具** | `sudo apt-get install -y ubuntu-advantage-tools` | 安裝 19.7 官方客戶端 |
| **綁定 Pro 帳號** | `sudo ua attach <TOKEN>` | 需持有合法 Token（未實測） |
| **檢視 UA 服務狀態** | `sudo ua status` | 檢視各項服務（`esm-infra-legacy` 等）支援與啟用狀況 |
| **啟用 Legacy 套件庫** | `sudo ua enable esm-infra-legacy` | 啟用 14.04 專屬的 Legacy ESM 來源（未實測） |
| **安裝 PHP5 測試套件** | `sudo apt-get install -y php5 php5-cli` | 安裝 Ubuntu 14.04 預設 PHP 環境 |
| **全系統生命週期健檢** | `ubuntu-support-status` | 14.04 內建工具，統計受支援與過期套件數 |
| **本地查詢已修補 CVE** | `sudo apt-get changelog <套件> \| grep <CVE>` | 比對套件 changelog 確認修復紀錄 |
| **官方 API 查證 CVE 狀態** | `curl -s https://ubuntu.com/security/cves/<CVE>.json` | 查詢 trusty 之修復狀態、目標版本與 pocket |
| **查詢關聯二進位套件** | `dpkg-query -W -f='${Package}\t${Source}\t${Status}\n' \| awk -F'\t' '($2 ~ /^php5( \|$)/ \|\| $1=="php5") && $3 ~ /installed/ {print $1}'` | 精準找出本機已安裝且來源為 php5 的所有套件 |
| **指定套件精準升級** | `sudo apt install --only-upgrade <套件清單>` | 避免全系統升級引發相依性變動（未實測） |
| **解除綁定** | `sudo ua detach` | 移除訂閱關聯 |
