---
title: 補上最後一塊：Zephyr LTS 把最長 15 年支援帶到車用微控制器 ECU
pubDate: 2026-11-06
canonicalTitle: "The missing piece: bringing up to 15 years of support to Zephyr for microcontroller-based ECUs"
canonicalUrl: https://canonical.com/blog/the-missing-piece-bringing-up-to-15-years-of-support-to-zephyr-for-microcontroller-based-ecus
canonicalAuthor: Jaume Rafols
canonicalPubDate: 2026-11-06T13:37:10Z
sourceFeed: Canonical Blog
summary: 一輛車裡除了少數高效能的中央運算 ECU，還有數百個以微控制器（MCU）為基礎的 ECU。Canonical 說明 Zephyr 26.04 LTS 怎麼用在這些車用 MCU 上：每個 LTS 最長 15 年的 CVE 監控、安全修補與 SBOM 產生，發布節奏比照 Ubuntu，並用 Canonical Workshop 提供現成的開發環境。
takeaway: 談軟體定義汽車時，大家多半看中央電腦，但車上數量最多的是數百個 MCU，而車子一開就是十幾年。這篇的重點是把 Ubuntu 那套 LTS 加長期修補的做法，延伸到跑 Zephyr RTOS 的微控制器上。我想進一步了解的是：「最長 15 年」需要什麼條件，以及支援哪些晶片。
tags:
  - Automotive
  - Security
  - Ubuntu Pro
---

## ikusupuroa 觀點

### 1. 先懂幾個名詞

- **ECU**（Electronic Control Unit，電子控制單元）：車上負責特定功能的控制器，例如電源分配、感測器讀取。
- **MCU**（Microcontroller Unit，微控制器）：資源很少的小型晶片，通常跑不了 Linux，而是跑 RTOS。
- **RTOS**（Real-Time Operating System，即時作業系統）：重視反應時間可預期的作業系統。**Zephyr** 是 Linux Foundation 底下的開源 RTOS 專案。
- **SDV**（Software-Defined Vehicle，軟體定義汽車）：車輛功能主要由軟體決定、可以透過更新改變的架構。
- **SBOM**（Software Bill of Materials，軟體物料清單）：列出軟體用了哪些元件與版本，資安稽核時用來追蹤漏洞影響範圍。
- **ISO/SAE 21434**：車用網路安全的國際標準。

### 2. 值得注意的地方：車上數量最多的是小晶片

原文的切入點是：軟體定義汽車的討論多半集中在高效能的中央運算 ECU，但車底下其實有數百個 MCU 型的 ECU。原文認為，這些 MCU 如果在車輛十幾二十年的使用期間沒人維護，會是很大的資安漏洞，例如沒修補的 MCU 可能成為進入 CAN、Ethernet AVB 這類車內主要匯流排的後門。

這篇讓我注意到，Canonical 把 Ubuntu LTS 那套長期修補的做法，延伸到跑不了 Linux 的微控制器上，連發布節奏也比照 Ubuntu：每兩年一個 LTS、每六個月一個 interim 版本。

### 3. 從 9 月的發表文補充的背景

> **本站補充**：以下取自 Canonical 2026 年 9 月 21 日的發表文〈[Canonical announces Zephyr 26.04 LTS](https://canonical.com/blog/zephyr-lts-announcement)〉，這篇原文開頭有連過去。

- Zephyr 26.04 LTS 是 **Ubuntu Pro for Devices** 訂閱的一部分，對象是晶片廠商與 ODM／OEM。
- 上游 Zephyr 專案本身提供 5 年的標準支援，Canonical 的版本延長到最長 15 年的安全維護。
- 發表文把它和歐盟 **Cyber Resilience Act**（CRA，網路韌性法案）連在一起：CRA 要求製造商為裝置提供至少 5 年的安全維護與修補。

對台灣來說，車用電子是很多供應鏈廠商的業務，產品如果要賣進歐洲市場，CRA 和 ISO/SAE 21434 這類要求就會直接影響韌體要維護多久。這段台灣情境是本站補充。

### 4. 還有哪些疑問

> **待確認**：「最長 15 年」的「最長」需要什麼條件（例如特定訂閱方案或特定 LTS 版本），原文與發表文都沒有說明。

> **待確認**：支援哪些 MCU 晶片與開發板，原文沒有列出。

> **待確認**：Canonical Workshop 怎麼安裝、是不是以 snap 發布，原文只說它是 Canonical 開發的開源工具，用一個指令就能在 Ubuntu 上啟動隔離的開發環境。

## 原文精華導讀

### 問題：車用 MCU 的維護缺口

原文指出，傳統的 MCU 生命週期管理靠的是自己維護的開源 fork（分支），或是專有的 RTOS 發行版，造成三個問題：

| 問題 | 原文的說明 |
| --- | --- |
| 工程孤島 | 內部團隊花上千小時替舊的 RTOS fork 打安全修補，而不是開發新產品 |
| 供應鏈弱點 | 沒修補的微控制器可能成為進入 CAN 或 Ethernet AVB 等車內主要匯流排的後門 |
| 合規瓶頸 | 要在幾十套不同廠商的 toolchain 與 SDK 之間追蹤 SBOM，拖慢法規稽核，也提高 ISO/SAE 21434 的責任風險 |

### Zephyr 26.04 LTS 提供什麼

- **每個 LTS 最長 15 年支援**：Canonical 提供最長 15 年的 CVE 監控、安全修補與 SBOM 產生。
- **可預期的發布節奏**：比照 Ubuntu，每兩年一個 LTS，每六個月一個 interim 更新。
- **涵蓋整套工具**：除了 Zephyr 的 RTOS kernel，也維護 **West** 這類必要的建置工具。West 是 Zephyr 的 meta-tool（綜合工具），負責建置、燒錄（flash）與管理 repository。

### 開發環境：Canonical Workshop

- Canonical Workshop 是 Canonical 開發的開源工具，用一個指令就能在 Ubuntu 上啟動沙盒化、可重現的開發環境。
- 透過 Zephyr 26.04 LTS 的 Workshop SDK，開發者在任何硬體上都能拿到現成的 Zephyr LTS 環境，內含必要的建置工具，可以略過複雜的本機 toolchain 設定，直接執行 West。

### 分工

原文的結論是：Zephyr LTS 負責關鍵任務需要的確定性即時效能，Canonical 負責長期的安全、合規與修補，讓開發者專心推出新功能。

### 出處

- 原文：[The missing piece: bringing up to 15 years of support to Zephyr for microcontroller-based ECUs](https://canonical.com/blog/the-missing-piece-bringing-up-to-15-years-of-support-to-zephyr-for-microcontroller-based-ecus)（Jaume Rafols，Canonical Blog，2026 年 11 月 6 日）
- 延伸閱讀：[Canonical announces Zephyr 26.04 LTS, delivering up to 15 years of support for MCU-grade devices](https://canonical.com/blog/zephyr-lts-announcement)（Canonical Blog，2026 年 9 月 21 日）
