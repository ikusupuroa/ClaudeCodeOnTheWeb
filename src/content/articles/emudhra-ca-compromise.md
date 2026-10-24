---
title: eMudhra 憑證機構私鑰外洩：Ubuntu 已撤銷信任，Java 系統要手動重建憑證庫
pubDate: 2026-10-24
canonicalTitle: eMudhra CA compromise fixes available
canonicalUrl: https://ubuntu.com/blog/emudhra-ca-compromise-fixes-available
canonicalAuthor: Luci Stanescu
canonicalPubDate: 2026-10-20T23:45:09Z
sourceFeed: Ubuntu Blog
summary: eMudhra 憑證機構（CA）的私鑰在 2026 年 10 月 20 日被證實外洩，攻擊者可簽發能通過驗證的假憑證。Ubuntu 已更新 ca-certificates 與 libnss3，移除兩個曾交叉簽署 eMudhra 的根憑證；但 Java 的根憑證庫因為一個尚未解決的問題，需要手動重建。
takeaway: 這次最容易被漏掉的是 Java：台灣金融、政府與企業的核心系統大量跑在 Java 上，更新 ca-certificates 不會自動清掉 Java 憑證庫裡的問題憑證，必須手動重建；而重建時，自己加進去的政府或企業內部 CA 憑證也會一起消失，要記得補回去。
tags:
  - Security
  - Ubuntu
---

## ikusupuroa 觀點

### 1. 為什麼跟台灣有關：問題不在 eMudhra，而在「交叉簽署」

eMudhra 是印度的憑證機構，台灣企業直接向它買憑證的情況不多。但這次的影響不只 eMudhra 本身：有兩個根憑證曾經交叉簽署（cross-sign）eMudhra，分別是 **emSign Root TLS CA – G3** 和 **Comodo AAA Certificate Services**。Ubuntu 為了讓外洩的 eMudhra 不再被信任，把這兩個根憑證一起移除了。

這代表：**任何最終鏈到這兩個根憑證的合法憑證，在更新後也不再被信任。** 原文評估這種情況不太可能發生，但如果你的系統更新後突然連不上某些外部服務（例如合作夥伴的 API、金流或物流介接），憑證鏈是第一個要檢查的地方。

### 2. Java 系統：更新完還要手動處理

這是台灣企業最該注意的一段。Ubuntu 打包的 OpenJDK 原本會跟著系統憑證庫同步，但目前同步機制有一個尚未解決的問題，所以**更新 ca-certificates 之後，Java 憑證庫裡的問題憑證不會自動移除**，需要手動重建（指令見下方導讀）。

台灣的銀行核心周邊、保險、政府機關與大型企業 ERP，大量使用 Java。建議：

1. 盤點所有跑 Java 應用程式的 Ubuntu 主機，包含 Tomcat、Spring Boot、Jenkins 等。
2. 重建 Java 憑證庫後**重啟 Java 應用程式**，讓新的憑證庫生效（本站補充，原文沒有特別提到重啟）。
3. 如果用的是 Oracle Java，另外依照 Oracle 針對 CVE-2026-91403 的公告處理。

### 3. 重建前先備份：自己加的憑證會被清掉

原文提醒：如果 Java 憑證庫裡有**手動加入、不在系統憑證庫中的 CA 憑證**，重建後要重新加回去。

以下是本站補充：台灣常見的情況包括政府憑證總管理中心（GRCA）相關憑證、企業內部 CA，或為了介接特定系統而匯入的憑證。建議重建前先匯出目前的清單備份，重建後逐一比對、補回，避免修完資安問題，卻讓內部系統之間連不上。

### 4. 桌面端：瀏覽器是 snap，各自更新

Ubuntu Desktop 上的瀏覽器通常是 snap 套件，不使用系統的 ca-certificates，而是由 snap 自己更新，預設一天自動更新四次。有關閉自動更新的企業桌機，要手動執行 `snap refresh`。

## 原文精華導讀

### 事件概要

- **發生了什麼**：2026 年 10 月 20 日，eMudhra 憑證機構的私鑰被證實已經外洩。
- **風險**：第三方可以簽發假的 X.509 憑證，並通過信任 eMudhra 的 TLS 用戶端驗證。攻擊者可以冒充任何網站（不論該網站實際使用哪一家 CA），進行中間人攻擊（attacker-in-the-middle），竊聽或竄改 TLS 連線。
- **緩解機制的限制**：公鑰釘選（public key pinning）或 DNS CAA 紀錄可以偵測假憑證，但要應用程式本身有支援，而且實際上用的人不多。
- **Ubuntu 的處理**：更新 ca-certificates 與 libnss3，移除 **emSign Root TLS CA – G3** 與 **Comodo AAA Certificate Services** 兩個根憑證。其中 AAA Certificate Services 在 22.04 以後的版本早就已經移除。
- **Java**：Oracle 於 10 月 21 日針對 Oracle Java 發布 CVE-2026-91403。Ubuntu 打包的 OpenJDK 使用系統憑證庫，本身不受影響，但 Java 憑證庫需要手動同步（原文於 10 月 22 日補充這段）。

### 受影響版本與修補狀態（ca-certificates）

| Ubuntu 版本 | 修補版本 |
| --- | --- |
| Trusty（14.04） | 20230311~14.04.1~esm3 |
| Xenial（16.04） | 202402031~16.04.1~esm3 |
| Bionic（18.04） | 202402031ubuntu0.18.04.1+esm3 |
| Focal（20.04） | 20240203~20.04.1ubuntu0.1~esm2 |
| Jammy（22.04） | 20260816ubuntu0.22.04.1 |
| Noble（24.04） | 20260816ubuntu0.24.04.1 |
| Resolute（26.04） | 20260816ubuntu0.26.04.1 |
| Stonking（26.10） | 20260816ubuntu0.26.10.1 |

26.10、26.04 LTS、24.04 LTS、22.04 LTS 透過一般更新取得修補；20.04 LTS 以前需要 Ubuntu Pro 的 ESM（延伸安全維護）。

### 檢查與修補

確認套件版本：

```bash
dpkg -l ca-certificates 'libnss3*' | grep ^ii
```

更新所有套件，或只更新受影響的元件：

```bash
sudo apt update && sudo apt upgrade
# 或
sudo apt update && sudo apt install --only-upgrade ca-certificates 'libnss3*'
```

unattended-upgrades（自動安全更新）在 16.04 以後預設開啟，會在 24 小時內自動套用。

### 重建 Java 根憑證庫（有用 Java 才需要）

先刪除現有的 Java 憑證庫，再從系統憑證庫重新產生：

```bash
sudo rm -f /etc/ssl/certs/java/cacerts
sudo update-ca-certificates --fresh
```

> 如果 Java 憑證庫裡有手動加入的 CA 憑證，執行後需要重新加回去。

### Ubuntu Desktop 使用者

瀏覽器多半以 snap 安裝，不使用 ca-certificates 的系統憑證庫。snap 預設一天自動更新四次；如果關閉了自動更新，請手動更新 snap。

### 出處

- 原文：[eMudhra CA compromise fixes available](https://ubuntu.com/blog/emudhra-ca-compromise-fixes-available)（Ubuntu Blog，Luci Stanescu，2026-10-20，10-22 更新）
- Ubuntu 安全公告：[USN-8944-1](https://ubuntu.com/security/notices/USN-8944-1)、[USN-8944-2](https://ubuntu.com/security/notices/USN-8944-2)、[USN-8947-1](https://ubuntu.com/security/notices/USN-8947-1)
- Oracle 公告：[CVE-2026-91403](https://www.oracle.com/security-alerts/alert-cve-2026-91403.html)
