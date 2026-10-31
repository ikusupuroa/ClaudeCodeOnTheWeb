---
title: 開源資安為什麼需要保密期（embargo）：從 php2shell 提前外洩看協調揭露
pubDate: 2026-10-31
canonicalTitle: Why embargoes matter for open source security
canonicalUrl: https://canonical.com/blog/why-embargoes-matter-for-open-source-security
canonicalAuthor: Rajan Patel
canonicalPubDate: 2026-10-30T00:01:00Z
sourceFeed: Canonical Blog
summary: Canonical 以 php2shell 為例，說明資安漏洞的保密期（embargo）為什麼重要：研究者、上游維護者與下游發行版在漏洞公開前私下協調，讓修補在公開的同一刻就能發布。這次漏洞細節在原定解禁日前兩天外洩，維護者把解禁時間提前到 10 月 21 日 14:00 UTC，Ubuntu 在解禁後隨即發布安全公告。
takeaway: 開源講求公開透明，但漏洞修補需要一段「先不說」的時間。php2shell 這次的例子很清楚：Ubuntu 的修補在外洩前一天就準備好了，真正決定主機安不安全的，是解禁之後我們自己多快更新、重啟服務。
tags:
  - Security
  - Ubuntu
  - PHP
---

## ikusupuroa 觀點

### 1. 開源也有「先不說」的時候

我原本以為開源就是什麼都公開，讀完這篇才比較理解保密期（embargo）的意義：漏洞一公開，攻擊者和使用者就同時起跑，攻擊者開始寫攻擊程式，使用者卻可能還沒有修補可以裝。保密期是研究者、上游維護者和發行版之間的共識，先把修補準備好、測試好，讓公開和修補在同一刻出現。

原文也強調，這套機制靠的是社群之間的信任，不是為了保密而保密。

### 2. 修補早就好了，差的是公開的時間點

原文的時間線裡，最讓我在意的是這兩個日期：

- **10 月 19 日**：Ubuntu 從 14.04 LTS 到 26.10 的修補都已經準備好。
- **10 月 20 日**：漏洞細節外洩。

也就是說，外洩的時候修補已經在等，只是還不能發布。維護者協調後把解禁時間提前到 **10 月 21 日 14:00 UTC**，換算成台灣時間是**晚上 10 點**。如果是台灣的維運團隊，修補正好在下班後才出來，值班和緊急變更的流程就很重要。這段時間換算與維運情境是本站補充。

### 3. 「發布到 security pocket」對舊版本的意思

原文說，解禁後修補發布到 Ubuntu 套件庫的 security pocket，開了 Unattended Upgrades（自動安全更新）的主機，預設設定會在 24 小時內自動安裝。

以下是本站補充：我在[〈在 Ubuntu 14.04／20.04／24.04 檢查 php2shell 漏洞〉](../../notes/ubuntu-1404-cve-check/)系列中實際查過官方 CVE 資料，24.04 的修補在 `noble-security`，20.04 的修補則在 Ubuntu Pro 的 `esm-infra`。所以：

- 還在標準支援期的版本（例如 24.04），照原文說的走一般安全更新。
- 已經進入延伸支援的版本（例如 20.04），要先綁定 Ubuntu Pro 才收得到修補，自動更新也是一樣。

另外，自動更新最晚可能要等一天才裝好。像 php2shell 這種已經外洩的高風險漏洞，我會選擇手動更新，不等排程。

### 4. 更新完，還要重啟服務

這篇原文沒有提到重啟，但本站之前的[〈php2shell 緊急修補〉](../php2shell-php-critical-vulnerability/)導讀已經整理過：套件更新後，Apache（`mod_php`）或 PHP-FPM 這類常駐服務要重啟，記憶體裡的舊程式碼才會換掉。保密期能做到的是讓修補準時出現，最後一步還是要靠我們自己完成。

### 5. 還有哪些疑問

> **待確認**：原文沒有說明細節是怎麼外洩的，也沒有提到保密期一般會持續多久，或是怎樣決定解禁日期。

我也好奇，如果是台灣的研究者或企業自己發現了開源軟體的漏洞，要怎麼參與這種協調揭露流程。原文提到的 [CERT/CC 協調揭露指南](https://certcc.github.io/CERT-Guide-to-CVD/howto/coordination/)可能是第一個可以讀的地方。

## 原文精華導讀

### 什麼是保密期（embargo）

- **保密期**：一段暫時的協議，讓軟體漏洞先不公開，讓廠商與維護者趕在攻擊者知道怎麼利用之前，做出修補並發布。
- 參與者包括研究者、上游維護者，以及 Canonical 這類下游發行版；大家私下協調，再一起公開。
- 目的不是為了保密而保密，而是讓主要發行版與雲端供應商在漏洞公開的同一刻，就已經把修補建置、測試好，可以立即發布。
- 整個機制靠社群之間的信任。一致的步調可以避免零散、混亂的修補，否則最容易受害的是反應最慢的使用者。

### 協調漏洞揭露（CVD）

- **協調漏洞揭露**（Coordinated Vulnerability Disclosure，CVD）是多方資安合作的黃金標準：廠商、研究者與維護者一起排定同步發布的時間。
- 開源生態的下游很多元，包括發行版、雲端供應商與企業作業系統廠商，大家都依賴同一份上游元件，所以 CVD 特別重要。
- Ubuntu 安全團隊遵循 CVD 原則：
  - 遇到高影響漏洞時，上游維護者會在嚴格的保密協議下，事先通知 Ubuntu 安全團隊的指定成員。
  - 安全團隊和上游開發者一起準備、驗證回移修補（backport），涵蓋各個支援中的 Ubuntu 版本。
  - 所有更新在事先約定的協調發布日（Coordinated Release Date，CRD）同步發布。

### 案例：php2shell

- PHP 的兩個遠端程式碼執行（RCE）漏洞 [CVE-2026-109618](https://ubuntu.com/security/CVE-2026-109618) 與 [CVE-2026-109619](https://ubuntu.com/security/CVE-2026-109619)，合稱 php2shell，CVSS 4.0 評分 9.2（重大）。
- 影響過去 14 年發布的所有 PHP 版本，從 PHP 5.4 到 8.5。

| 日期 | 事件 |
| --- | --- |
| 10 月 16 日 | Ubuntu 安全團隊透過可信任的社群管道，在保密期下收到漏洞細節 |
| 10 月 19 日 | 14.04 LTS 到 26.10 所有安全維護中版本的修補都已準備好 |
| 10 月 20 日 | 細節外洩，比原定的解禁日早兩天 |
| 10 月 21 日 | Wikipedia，以及芬蘭、英國、荷蘭多個政府網站暫時下線部分頁面，爭取修補時間 |
| 10 月 21 日 14:00 UTC | 維護者共同議定的新解禁時間；解禁後 Ubuntu 發布 [USN-8948-1](https://ubuntu.com/security/notices/USN-8948-1) 與 [USN-8948-2](https://ubuntu.com/security/notices/USN-8948-2) |

### Ubuntu 這次怎麼做

1. **提早收到通知**：透過可信任的社群管道，在保密期間取得細節。
2. **快速修補與回移**：不同 Ubuntu 版本支援的 PHP 版本不同，舊的穩定系統要小心回移，才能修好漏洞又不破壞相容性。
3. **嚴格測試**：保密期間，更新後的套件跑過自動化測試流程，確認穩定、不會讓正式環境出問題。
4. **同步發布**：解禁的那一刻，修補發布到 Ubuntu 套件庫的 security pocket；開了 Unattended Upgrades 的使用者，預設設定每 24 小時會自動安裝可用的修補。

原文也提到，外洩發生時，資安團隊必須在壓力下加快腳步，但品質、驗證、溝通，以及和維護者的協調都不能打折扣。

### 結論

- 開源社群由廠商、獨立貢獻者與研究者交織而成，快速行動有時會讓協調揭露的流程承受壓力；原文主張與其互相指責，不如強化彼此的連結。
- 遵守保密期，可以避免攻擊者搶先逆向分析修補、在其他人修補前發動攻擊。
- Canonical 感謝上游維護者與社群夥伴，認為尊重保密期、累積社群信任，保護的不只是 Ubuntu，而是整個開源生態。

### 出處

- 原文：[Why embargoes matter for open source security](https://canonical.com/blog/why-embargoes-matter-for-open-source-security)（Canonical Blog，Rajan Patel，2026-10-30）
- 協調揭露指南：[CERT Guide to Coordinated Vulnerability Disclosure](https://certcc.github.io/CERT-Guide-to-CVD/howto/coordination/)
- 安全公告：[USN-8948-1](https://ubuntu.com/security/notices/USN-8948-1)、[USN-8948-2](https://ubuntu.com/security/notices/USN-8948-2)
