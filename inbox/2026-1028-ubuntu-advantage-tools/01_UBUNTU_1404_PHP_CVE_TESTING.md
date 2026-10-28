# Ubuntu 14.04 PHP CVE 弱點驗證與 Ubuntu Advantage 修復測試指南

---

## 一、情境與背景說明 (Overview & Background)

在企業資安合規與舊系統維運（Legacy System Maintenance）情境中，針對已終止標準支援（End-of-Life, EOL）的舊版作業系統進行 CVE（Common Vulnerabilities and Exposures，通用弱點與漏洞）驗證與修復測試是一項關鍵任務。

* **測試對象**：Ubuntu 14.04 LTS (Trusty Tahr)，其標準 5 年公用安全性維護已於 2019 年 4 月結束。
* **測試漏洞標的**：影響廣泛的 PHP 致命遠端程式碼執行（RCE，代號 PHP2Shell）雙漏洞：
  * [CVE-2026-109618](https://ubuntu.com/security/CVE-2026-109618)：PHP2Shell OOM 記憶體毀損漏洞（CVSS 9.8 / Critical）。
  * [CVE-2026-109619](https://ubuntu.com/security/CVE-2026-109619)：PHP2Shell Worker 全域狀態殘留漏洞（CVSS 9.8 / Critical）。
* **核心測試目標**：
  1. 建立輕量且完全隔離的測試沙盒環境（Testbed）。
  2. 部署 Ubuntu Advantage / Ubuntu Pro 延伸維護（ESM, Expanded Security Maintenance）用戶端與目標測試套件（PHP5）。
  3. 驗證系統生命週期狀態，並運用兩大標準途徑比對特定 CVE 弱點的受影響狀況。
  4. 驗證透過 ESM 進行指定套件精準修補（`--only-upgrade`）的標準作業程序。

---

## 二、第一步：建立隔離測試環境 (Setup Isolated Testbed Environment)

為避免弱點測試干擾主機或其他正式服務，推薦透過 LXD 系統容器秒級拉起獨立、輕量的 Ubuntu 14.04 測試沙盒實例（命名為 `trusty-cve`）。

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
確認狀態為 `RUNNING` 且已取得 IPv4 位址（若 IPv4 欄位為空，請確認宿主機 UFW 防火牆已放行 `sudo ufw allow in on lxdbr0` 與 `sudo ufw route allow in on lxdbr0`）。

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
> **重要特性說明：Ubuntu LTS 官方套件庫保留機制**
>
> 雖然一般的非 LTS 舊發行版（如 14.10、15.04 等）在生命週期結束後會被下線並移至 `old-releases.ubuntu.com`，但 **Ubuntu LTS（長期支援版，如 14.04 Trusty Tahr）** 因享有 Canonical **Ubuntu Pro / ESM（Extended Security Maintenance）** 的支援，官方依然完整保留了 `archive.ubuntu.com` 與 `security.ubuntu.com` 的套件樹。
> 
> 在官方提供的 Ubuntu 14.04 映像檔中，預設的 `/etc/apt/sources.list` 與 cloud-init 配置已經正確指向標準鏡像站與 ESM 來源，**完全無須手動置換至 `old-releases`**，維持預設即可直接更新。

在容器終端機內，直接執行標準更新指令：

```bash
sudo apt-get update
```

輸出中會同時命中標準與 ESM 索引來源：
```text
Hit http://security.ubuntu.com trusty-security InRelease
Hit http://archive.ubuntu.com trusty InRelease
Hit https://esm.ubuntu.com trusty-infra-security InRelease
Hit https://esm.ubuntu.com trusty-infra-updates InRelease
Reading package lists... Done
```

---

## 四、第三步：部署 Ubuntu Advantage 工具與 PHP 測試標的 (Deploy UA Client & Target Package)

更新完套件清單後，即可安裝 Canonical 官方弱點維護工具與目標測試套件。

### 1. 安裝與設定 Ubuntu Advantage 用戶端
Ubuntu 14.04 中的管理套件名稱為 `ubuntu-advantage-tools`：

```bash
# 1. 安裝工具套件
sudo apt-get install -y ubuntu-advantage-tools

# 2. 綁定 Ubuntu Pro / Advantage 訂閱權益 Token（個人免費版可於官網取得）
sudo ua attach <TOKEN>

# 3. 檢查訂閱綁定與服務啟用狀態
sudo ua status
```

安裝完成後，系統會提供 CLI（Command Line Interface，命令列介面）工具：
* 主要指令：`ubuntu-advantage`
* 簡寫指令：`ua`
* （註：現代 Ubuntu 的 `pro` 指令在 19.7 版中尚未引進，請統一使用 `ua`）。

檢查工具版本：
```bash
ua version
# 或
ubuntu-advantage version
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
> **版本重大意義分析：`5.5.9-1ubuntu4.29` 是標準公用維護的最終版本（Baseline）**
>
> 注意輸出中的編譯時間 `Apr 22 2019 18:33:52`，這正是 Ubuntu 14.04 五年標準支援到期（2019 年 4 月）當月所發布的**最後一個免費公用版本（Final GA / Public Security Version）**。
> 在 2019 年 5 月之後所揭露的所有新 PHP 漏洞（例如嚴重的 PHP2Shell 遠端執行代碼漏洞 [CVE-2026-109618](https://ubuntu.com/security/CVE-2026-109618) 與 [CVE-2026-109619](https://ubuntu.com/security/CVE-2026-109619)），官方修補套件版本均標註為 `5.5.9-1ubuntu4.29+esmX`，必須透過 Ubuntu Pro / ESM 才能取得修補更新。

---

## 五、第四步：系統安全性健檢與 CVE 漏洞測試實務 (Security Audit & CVE Testing)

> [!IMPORTANT]
> **版本差異警示：Ubuntu 14.04 之 `ubuntu-advantage-tools` 限制**
>
> 在較新的 Ubuntu 版本（16.04+ / 20.04+）中，`ubuntu-advantage-tools` 已升級至 v27+，提供 `ua fix <CVE>` 與 `ua security-status` 等自動化指令。
> 然而，**在 Ubuntu 14.04 (Trusty Tahr) 中，官方維護之最新版本固定為 `19.7`（例如 `19.7ubuntu0.2`）**。
>
> 執行 `ua --help` 可見 19.7 支援的子命令僅限於：
> `status`、`attach`、`detach`、`enable`、`disable`、`refresh`、`version`、`help`
> 若執行 `ua security-status` 或 `ua fix` 會直接報錯：`invalid choice: 'security-status'`。
> 因此在 14.04 中，需依循以下專屬規範來檢視狀態與查詢 CVE 漏洞。

---

### 1. 檢視 Ubuntu Advantage 與系統支援狀態 (Check Status)

#### A. 檢視 Pro / ESM 訂閱與服務啟用狀態
透過 `sudo ua status` 指令，可檢視目前系統關聯的合約與 ESM 模組狀態：

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
* **SERVICE**：各項安全性維護模組。
* **AVAILABLE**：該服務是否適用於當前架構與系統（`esm-infra` 與 `esm-infra-legacy` 均標記為 `yes`）。
* **狀態警示**：若尚未關聯帳號，會明確提示 `This machine is not attached to a UA subscription.`，指引至官方儀表板取得 Token。

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
  * **100% 套件（全數 448 個）均標示為 `unsupported`**：因 Ubuntu 14.04 標準支援終止日（2019 年 4 月）已過，系統判定當前所有安裝之套件已完全失去公用安全性支援。
  * 這明確反映出系統若要在生產或測試環境中安全運行，必須依賴 Ubuntu Pro / ESM 提供後續 CVE 安全性更新。

---

### 2. 在 Ubuntu 14.04 查詢 CVE 漏洞的兩大標準途徑 (Query CVE Methods)

因為 `19.7` 版尚未內建 `ua fix` 命令，針對已安裝套件（例如 `php5`）查詢特定重大 CVE 漏洞時（以下以影響廣泛的 PHP2Shell 雙重大弱點 [CVE-2026-109618](https://ubuntu.com/security/CVE-2026-109618) 與 [CVE-2026-109619](https://ubuntu.com/security/CVE-2026-109619) 為例），可採用以下標準方式：

#### 途徑 1：透過 APT 本地套件 Changelog 查詢已修補的 CVE（免網路／本機即時）
Ubuntu 在維護每個安全性修補時，都會在 package changelog 中強制記錄對應的 CVE 編號與 USN 安全公告。

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
* **判定原則**：若 grep 無任何輸出，代表目前安裝之版本（`5.5.9-1ubuntu4.29`）因編譯於 2019 年 4 月，尚未包含後續揭露的重大漏洞修護。

---

#### 途徑 2：透過 Canonical 官方 CVE Tracker REST API（官方權威查證，推薦）
Canonical 官方資安團隊為 Ubuntu 每個發行版（包含 Trusty）維護了公開的 CVE JSON API，能即刻查詢特定 CVE 在 Ubuntu 14.04 的修復狀態與版本：

```bash
# 1. 安裝輕量查詢工具 curl 與 jq
sudo apt-get install -y curl jq

# 2. 查詢 [CVE-2026-109618](https://ubuntu.com/security/CVE-2026-109618) 在 trusty 上的 php5 修復詳情
curl -s "https://ubuntu.com/security/cves/CVE-2026-109618.json" | \
  jq '.packages[] | select(.name=="php5") | {package: .name, status: .statuses[] | select(.release_codename=="trusty")}'

# 3. 查詢 [CVE-2026-109619](https://ubuntu.com/security/CVE-2026-109619) 在 trusty 上的 php5 修復詳情
curl -s "https://ubuntu.com/security/cves/CVE-2026-109619.json" | \
  jq '.packages[] | select(.name=="php5") | {package: .name, status: .statuses[] | select(.release_codename=="trusty")}'
```

**回傳結果結構範例**：
```json
{
  "package": "php5",
  "status": {
    "release_codename": "trusty",
    "status": "released",
    "description": "5.5.9+dfsg-1ubuntu4.29+esmX"
  }
}
```

* **分析**：
  * **漏洞背景**：[CVE-2026-109618](https://ubuntu.com/security/CVE-2026-109618)（OOM 記憶體毀損）與 [CVE-2026-109619](https://ubuntu.com/security/CVE-2026-109619)（Worker 全域狀態殘留）均為 CVSS 9.8 的致命遠端程式碼執行（RCE，代號 **PHP2Shell**）漏洞，影響所有處理網頁請求的 PHP 工作環境（如 PHP-FPM、`mod_php`）。
  * **ESM 專屬修補**：Canonical 針對此類在標準 EOL 後出現的漏洞，統一透過 ESM（如 `USN-8948-2` 安全公告）在 `esm.ubuntu.com` 提供專屬更新套件（版本後綴包含 `+esm`）。
  * **本地風險研判**：比對本地現行安裝版本 `5.5.9-1ubuntu4.29`，可確證此容器實例**直接暴露於 PHP2Shell 攻擊風險**，必須綁定 Ubuntu Pro 啟用 `esm-infra` 後執行升級以化解威脅。

---

### 3. 綁定 Ubuntu Pro Token 並套用修復更新 (Attach & Upgrade)

當確認系統存在需要修復的 CVE 漏洞後，若持有 Ubuntu Pro 授權：

```bash
# 1. 綁定 Token
sudo ua attach <YOUR_PRO_TOKEN>

# 2. 啟用 ESM-Infra 專屬套件庫
sudo ua enable esm-infra

# 3. 確認服務啟用狀態
sudo ua status

# 4. 更新套件清單快取
sudo apt-get update

# 5. 正確套件升級做法：精準升級目標套件
sudo apt install --only-upgrade php5
```

> [!TIP]
> **正確的套件更新做法說明：為什麼使用 `sudo apt install --only-upgrade php5`？**
>
> 1. **避免全面升級風險 (Avoid Full Upgrade)**：在舊系統（Legacy System）或生產環境中，若直接下達 `sudo apt upgrade`，可能會同時觸發數百個底層核心函式庫與相依套件的大規模升級，極易引發非預期的相容性破壞。
> 2. **精準修補目標弱點 (Targeted Patching)**：`--only-upgrade` 參數保證**只有在該套件（`php5`）已安裝在系統上時才執行升級**；若系統原本未安裝該軟體，則不會擅自額外安裝。這符合資安合規中「以最小異動量完成指定 CVE 修補」的黃金原則。

升級完成後，再度透過 `dpkg -l php5` 與 `php -v` 即可確認已套用最新 ESM 安全版號。

---

## 六、常用指令與排錯速查表 (Quick Reference)

| 操作目標 | 容器內執行指令 | 說明 |
| :--- | :--- | :--- |
| **更新套件庫清單** | `sudo apt-get update` | LTS 版官方保留 archive 來源，維持預設直接更新即可 |
| **安裝 UA 工具** | `sudo apt-get install -y ubuntu-advantage-tools` | 安裝 19.7 官方客戶端 |
| **綁定 Pro 帳號** | `sudo ua attach <TOKEN>` | 啟用 ESM 下載受保護安全性套件 |
| **檢視 UA/ESM 服務狀態** | `sudo ua status` | 檢視各項服務（`esm-infra`）啟用與授權狀況 |
| **安裝 PHP5** | `sudo apt-get install -y php5 php5-cli` | 安裝 Ubuntu 14.04 預設 PHP 環境 |
| **全系統生命週期健檢** | `ubuntu-support-status` | 14.04 內建工具，統計受支援與過期套件數 |
| **本地查詢已修補 CVE** | `sudo apt-get changelog <套件> \| grep <CVE>` | 比對套件 changelog 確認修復紀錄 |
| **官方 API 查證 CVE 狀態** | `curl -s https://ubuntu.com/security/cves/<CVE>.json` | 精準查詢 trusty 之修復狀態與目標版本 |
| **正確套件更新做法（精準修補）** | `sudo apt install --only-upgrade php5` | 僅升級目標套件，避免全域升級引發相容性破壞 |
| **解除綁定** | `sudo ua detach` | 移除訂閱關聯 |
