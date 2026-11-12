---
title: Ubuntu Pro 新增 Edge archive：用 AI 產生的 CVE 修補先給想自己驗證的人，正式更新仍由人工把關
pubDate: 2026-11-12
canonicalTitle: New Edge archive offers opt-in AI-driven security remediation and backports
canonicalUrl: https://canonical.com/blog/new-edge-archive-offers-opt-in-ai-driven-security-remediation-and-backports
canonicalAuthor: Canonical
canonicalPubDate: 2026-11-12T09:56:47Z
sourceFeed: Canonical Blog
summary: Canonical 為 Ubuntu Pro 使用者新增 Edge archive，提供由多代理框架 Surge 自動產生的 CVE 修補與 backport（把新版修補移植到舊版程式碼）。這些修補是「還沒通過完整測試」的預覽，自願選用；Ubuntu 的正式安全更新維持人工驗證，kernel 修補不在 Surge 範圍內。
takeaway: 這篇有兩個重點：一是 Canonical 把 AI 用在 CVE 修補上，但明講不會自動上傳到穩定版，Edge archive 只是給想自己驗證的人提早拿到修補；二是 Ubuntu 的安全更新政策沒有改，仍然是人工驗證。我還想知道的是，Edge archive 的修補跟正式更新衝突時怎麼處理，以及 Surge 產生的修補要怎麼追溯。
tags:
  - Security
  - Ubuntu Pro
  - AI
---

## ikusupuroa 觀點

### 1. 先懂幾個名詞

- **CVE**（Common Vulnerabilities and Exposures，通用漏洞揭露）：公開漏洞的編號，例如本站前面介紹過的 CVE-2026-98432。
- **backport**（向後移植）：把新版軟體裡的安全修補，移植到舊版的程式碼上。Ubuntu 為了穩定，通常不會直接升級整個套件版本，而是只把修補移植回去。
- **Surge**：Canonical 自己開發的多代理（multi-agent）框架，用來做 CVE 修補與 backport。
- **Edge archive**：Ubuntu Pro 使用者可以選用的新套件庫，放還沒通過完整測試的修補。
- **userspace**（使用者空間）：作業系統裡 kernel 以外的程式與函式庫。

### 2. 值得注意的地方：AI 加速，但沒有取代把關

原文開頭說明的背景是：AI 代理讓漏洞通報與攻擊暴增，Canonical 的資安團隊今年已經發布了去年兩倍的安全修補，但人工工程、審查和大規模的長時間測試，仍然比有些系統暴露在外的使用者能等的時間更久。

讀完後我覺得這篇比較中肯的地方，是它沒有把「用 AI 修漏洞」說成萬靈丹，而是把兩件事分開：

- **Edge archive**：Surge 產生的修補，可以提早拿到，但還沒通過完整測試，**由使用者自己決定要不要用、自己負責驗證**。
- **正式的安全更新**：原文明講「這是自願選用的預覽，不是安全政策的改變」，Ubuntu 的安全更新仍然嚴格由人工驗證，經過原本的更新與安全管道發布。

換句話說，原文提供的是「提早拿修補的選項」，而不是「修補品質標準降低」。

### 3. kernel 不在這次範圍

原文特別說明，kernel 的 CVE 修補不屬於 Surge。理由是 kernel 需要不同的 backport 架構，而且「直接出貨最新版」對企業系統穩定性的風險很大。kernel 這邊走的是兩週一輪的 SRU（Stable Release Update，穩定版更新）週期，修補先放進 `-proposed`，通過認證後才進 `-updates`。本站〈[Linux kernel 漏洞 CVE-2026-98432](../linux-kernel-cve-2026-98432-proposed/)〉那篇就是這個流程的例子。

### 4. 還有哪些疑問

> **待確認**：原文只說 Edge archive 對 Ubuntu Pro 使用者開放，沒有說明適用哪些 Ubuntu 版本，也沒有說明 Edge archive 的修補和後來正式發布的更新版本衝突時，套件要怎麼處理。

> **待確認**：Surge 產生的修補，要怎麼追溯是哪些模型、哪一輪審查產生的，原文只說「可追溯」，沒有說明方式。

> **待確認**：如何啟用 Edge archive，原文只放了一個連到 Ubuntu Discourse 的連結，內容本站沒有確認。

## 原文精華導讀

### 背景：AI 帶來的兩難

- AI 代理驅動了前所未有的漏洞通報與攻擊潮，Canonical 資安團隊今年發布的安全修補已經是去年的兩倍。
- 但人工工程與審查、大規模長時間測試，需要的時間比一些使用者能忍受的更長。
- 原文把這形容成一個兩難：要保護整個生態，修補速度必須快上好幾個數量級（用 AI 對抗 AI）；但對會影響數百萬使用者的變更，又有責任測試、審查與把關。
- Canonical 的立場是不降低穩定版的審查與測試承諾，但可以在延伸測試完成前，提早提供修補，讓客戶選擇自己驗證，並依自己能接受的速度套用到正式環境。

### Edge archive 是什麼

- **Surge**：多代理的 CVE 修補與 backport 框架。Canonical 對它的能力已有高度信心，但**不會自動把 Surge 產生的修補上傳到穩定版**。
- **從今天起**，這些修補開放給 Ubuntu Pro 使用者，放在新的 Edge archive。
- 這是「開發中修補的自願預覽」，不是安全政策的改變；Ubuntu 的安全更新仍然是嚴格的人工驗證，走原本的更新與安全管道。
- Edge archive 提供的是還沒通過資格認證、也還沒升為正式發布（GA）的機器產生 CVE 修補。

### Surge 的運作方式

Surge 針對 Ubuntu 的使用者空間套件，自動分類漏洞、實作 backport、驗證修補。原文列出的流程，是由多個目的專一、使用不同競爭模型的代理（agent）組成：

| 階段 | 原文的說明 |
| --- | --- |
| 接收與來源 | 讀入漏洞資訊來源，對應到受影響套件；如果受影響的套件不在 Ubuntu，就提早中止 |
| 程式碼鑑識 | 獨立抓取上游的修補與原始碼，取出需要的上下文 |
| backport 引擎 | 同時執行多個互相競爭的 backport 模型，合成候選修補 |
| 共識式評審 | 由一組獨立的進階評審模型評估候選修補，對分歧的結果得出權威共識 |
| 人工升級與監督 | 邊緣案例、低信心分數或票數僵持的情形，自動轉給 Ubuntu 資安工程師人工審查 |
| 建置與驗證 | 建置通過驗證的修補，並像一般 Ubuntu 套件一樣跑確定性測試後才發布 |

原文強調，各個專責的代理操作同一個共用的紀錄系統，讓 Surge 能夠大規模輸出可靠、可追溯的修補；設下的防護欄（guardrails）要同時防範修補造成的回歸（regression），以及現代的供應鏈攻擊。原文也說，Canonical 正在大量投資於受監督的驗證、詳盡測試與認證（attestation），修補速度越快，品質與安全門檻也跟著提高。

### kernel 為什麼不在內

- kernel 本質上需要不同的 backport 架構，單純「出貨最新版」對企業系統穩定性是很大的風險。
- Canonical 最近推出的是**兩週一輪的 SRU 週期**：重疊進行兩週一輪的週期，每週都發布一個新的 proposed kernel 供客戶選用，經過一週的延伸浸泡測試（soak testing）後，才發布到穩定更新管道。
- 通過基本的冒煙測試（smoke test）後，kernel 修補先發布到 `-proposed` pocket，任何人都可以拿來做內部測試或前沿部署。
- 第二週進行完整的 kernel 認證壓力測試，針對數千台通過 Ubuntu 認證的實體機器檢驗效能與正確性；只有通過的 kernel 才會升為正式發布，放進 `-updates` pocket。

### 保護共同的生態

- Surge 專注於已知漏洞的積壓清單。
- 新發現的漏洞，包括 Canonical 自己用自動化研究找到的，仍然堅持負責任的揭露（responsible disclosure），在嚴格的禁運（embargo）下與上游社群與維護者協調。原文明確表示不同意那些放棄協調式揭露做法的人。
- 透過對個人使用仍免費的 Ubuntu Pro，研究者與進階使用者可以在真實環境評估機器產生的修補，協助 Canonical 驗證穩定性，再決定是否升為 LTS 的正式發布。
- 原文最後邀請讀者啟用 Edge archive、測試修補並回報意見。

### 出處

- 原文：[New Edge archive offers opt-in AI-driven security remediation and backports](https://canonical.com/blog/new-edge-archive-offers-opt-in-ai-driven-security-remediation-and-backports)（Canonical，Canonical Blog，2026 年 11 月 12 日）
- 原文提到的延伸閱讀：[Accelerating delivery of CVE fixes with a new kernel release strategy](https://canonical.com/blog/accelerating-delivery-of-cve-fixes-with-a-new-kernel-release-strategy)（Canonical Blog）、[How to enable the Edge archive](https://discourse.ubuntu.com/t/how-to-enable-the-edge-archive/)（Ubuntu Discourse）
