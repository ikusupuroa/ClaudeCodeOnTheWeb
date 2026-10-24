---
title: curl 一次修補 22 個漏洞：高風險漏洞只影響 26.04 LTS，但每台主機都該更新
pubDate: 2026-10-24
canonicalTitle: Fixes available for CVE-2026-92392 and other curl vulnerabilities
canonicalUrl: https://ubuntu.com/blog/curl-vulnerabilities-fixes-available
canonicalAuthor: Luci Stanescu
canonicalPubDate: 2026-10-14
sourceFeed: Ubuntu Blog
summary: curl 專案在 2026 年 10 月 14 日一次公開 22 個安全漏洞，其中只有 CVE-2026-92392 為高風險（可能導致遠端程式碼執行），而且只影響 Ubuntu 26.04 LTS。Ubuntu 已為所有受影響版本釋出修補，同時涵蓋 curl 指令與 libcurl 函式庫。
taiwanTakeaway: 對已經導入 26.04 LTS 的台灣企業，這次要優先處理；其他版本雖然只有中低風險漏洞，但 libcurl 藏在 PHP、Git 和各種應用程式底下，系統更新之外，也別忘了容器映像檔與自帶 libcurl 的軟體。
tags:
  - Security
  - Ubuntu
---

## 🇹🇼 台灣觀點點評

### 1. 先看版本：26.04 LTS 是重點

這次唯一的高風險漏洞 **CVE-2026-92392** 只影響 **Ubuntu 26.04 LTS（Resolute Raccoon）**。26.04 是今年才發布的 LTS 版本，台灣企業若已經在新專案或新主機上採用，應該排第一優先更新。

其他版本（22.04、24.04 等）受到的是中低風險漏洞，可以依照正常的修補週期處理；有開自動安全更新的主機，24 小時內就會自動裝好。

### 2. libcurl 比你想的更常見

curl 不只是指令列工具。**libcurl** 是許多軟體底層的網路函式庫，例如 PHP 的 curl 擴充功能、Git 的 HTTPS 傳輸，以及大量自行開發的應用程式。這次的修補同時涵蓋 curl 指令與 libcurl。

以下是本站補充，原文沒有涵蓋：

- **容器映像檔**：容器內的 curl／libcurl 不會跟著主機更新，需要重建映像檔、重新部署。
- **自帶 libcurl 的軟體**：部分商業軟體或用靜態連結（static linking）編譯的程式，會內建自己的 libcurl 版本，要另外確認原廠是否釋出更新。

### 3. 高風險漏洞的實際門檻

原文說明，CVE-2026-92392 要成功利用，**必須讓 curl 連到惡意伺服器**，而且觸發條件複雜。所以只連線到可信任伺服器的系統，風險相對較低。

不過台灣企業常見的情境，例如爬蟲、Webhook 轉發、依使用者輸入的網址抓取內容的服務，本來就會連到不受控的外部網址，這類系統即使不在 26.04 上，也應該優先更新。

### 4. 老版本主機一樣需要 Ubuntu Pro

14.04 到 20.04 的修補版本都帶有 `+esm`，只透過 Ubuntu Pro 的 ESM（延伸安全維護）提供。這是本站近期第三篇提到同樣狀況的安全公告：手上還有舊版主機的企業，值得把 Ubuntu Pro 列入評估，做法可參考[〈在 AWS 上把 Ubuntu LTS 原地轉成 Ubuntu Pro〉](../ubuntu-pro-aws-upgrade/)。

## 原文精華導讀

### 事件概要

- 2026 年 10 月 7 日，curl 維護者 Daniel Stenberg 預告將在 10 月 14 日發布新版，一次修補 **22 個安全漏洞**；修補已按計畫在該日公開。
- curl 維護者事先在保密期間（embargo）與 Ubuntu 等下游廠商協調。
- 所有散布 curl 的作業系統都受影響，包含各 Linux 發行版。
- Ubuntu 已發布 [USN-8927-1](https://ubuntu.com/security/notices/USN-8927-1) 與 [USN-8932-1](https://ubuntu.com/security/notices/USN-8932-1)，修補所有受影響版本。

> **待確認**：原文開頭寫 22 個漏洞，但下方列出的 CVE 編號有 24 個。原文另外提到其中有兩個問題屬於 Ubuntu 未支援的 TLS 後端，可能就是數字不同的原因，但原文沒有明說。

### 嚴重程度

| 漏洞 | 評估 | 影響版本 |
| --- | --- | --- |
| CVE-2026-92392 | Ubuntu 安全團隊評為 CVSS 3.1 **8.1（HIGH）**，可能導致遠端程式碼執行 | 只有 26.04 LTS |
| CVE-2026-92388 | 與上者同屬 use-after-free（釋放後使用）漏洞；curl 專案評為低風險 | 只影響以特定方式使用 FTP 功能的 libcurl 應用程式，不影響 curl 指令 |
| 其他漏洞 | 低至中風險 | 依版本而定 |

其他漏洞的類型包括：

- 透過多種協定與代理伺服器，把驗證憑據（包含 Kerberos 票證）洩漏到錯誤的連線
- TFTP、IMAP 的協定狀態機問題，可能造成阻斷服務或資訊外洩
- HTTP 伺服器可以清空或截斷 cookie jar
- HSTS 到期與持久性問題
- SSH 主機金鑰檢查問題
- GnuTLS 版本的資料外洩
- 記憶體耗盡造成的阻斷服務
- 兩個 Ubuntu 未支援的 TLS 後端問題

### 各版本修補狀態

| Ubuntu 版本 | 修補版本 | CVE-2026-92392 |
| --- | --- | --- |
| Trusty（14.04） | 7.35.0-1ubuntu2.20+esm24 | 不受影響 |
| Xenial（16.04） | 7.47.0-1ubuntu2.19+esm21 | 不受影響 |
| Bionic（18.04） | 7.58.0-2ubuntu3.24+esm15 | 不受影響 |
| Focal（20.04） | 7.68.0-1ubuntu2.25+esm10 | 不受影響 |
| Jammy（22.04） | 7.81.0-1ubuntu1.30 | 不受影響 |
| Noble（24.04） | 8.5.0-2ubuntu10.16 | 不受影響 |
| Resolute（26.04） | 8.18.0-1ubuntu2.8 | **受影響** |

26.04 LTS、24.04 LTS、22.04 LTS 透過一般更新取得修補；20.04 LTS 以前需要 Ubuntu Pro 的 ESM。

### 檢查與修補

列出由 curl 原始碼套件產生、已安裝的套件與版本：

```bash
apt list '?installed ?source-package(^curl$)'
```

更新所有套件，或只更新 curl 相關套件：

```bash
sudo apt update && sudo apt upgrade
# 或
sudo apt update && sudo apt install --only-upgrade '?source-package(^curl$)'
```

unattended-upgrades（自動安全更新）在 16.04 以後預設開啟，會在 24 小時內自動套用。

### 出處

- 原文：[Fixes available for CVE-2026-92392 and other curl vulnerabilities](https://ubuntu.com/blog/curl-vulnerabilities-fixes-available)（Ubuntu Blog，Luci Stanescu，2026-10-14）
- curl 維護者預告：[Twenty-two pending curl vulnerabilities](https://daniel.haxx.se/blog/2026/10/07/twenty-two-pending-curl-vulnerabilities/)
- 高風險漏洞說明：[CVE-2026-92392（Ubuntu）](https://ubuntu.com/security/CVE-2026-92392)、[CVE-2026-92392（curl）](https://curl.se/docs/CVE-2026-92392.html)
