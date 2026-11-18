---
title: Canonical 與華為鯤鵬合作：Kunpeng 處理器會有最佳化的 Ubuntu 映像檔，也能買 Ubuntu Pro
pubDate: 2026-11-18
canonicalTitle: Canonical and Huawei Kunpeng announce collaboration to deliver optimized Ubuntu and Ubuntu Pro on Kunpeng hardware
canonicalUrl: https://canonical.com/blog/canonical-huawei-kunpeng-announce-collaboration-optimized-ubuntu
canonicalAuthor: Jonathan Mok
canonicalPubDate: 2026-11-18T09:00:00Z
sourceFeed: Canonical Blog
summary: Canonical 與華為鯤鵬（Kunpeng）運算部門宣布合作，為 Kunpeng 處理器提供最佳化的企業級 Ubuntu 映像檔，客戶也能購買 Ubuntu Pro，取得 Ubuntu、Canonical OpenStack、MicroCloud、Kubernetes 與 Ceph 的安全維護與支援，最長 15 年。原文是合作公告，沒有提供映像檔的取得方式、時程或效能數據。
takeaway: 這篇是合作公告，重點是「Kunpeng 硬體 + 預先驗證過的 Ubuntu 映像檔 + Ubuntu Pro 支援」這個組合。原文沒有說映像檔什麼時候能用、怎麼取得，也沒有任何效能數字，所以目前只能當成方向性的訊號。我還想知道的是，映像檔用的是哪個 Ubuntu 版本、和一般 arm64 映像檔差在哪裡。
tags:
  - Ubuntu
  - Ubuntu Pro
  - Cloud
---

## ikusupuroa 觀點

### 1. 先懂幾個名詞

- **Kunpeng（鯤鵬）**：華為的伺服器處理器系列，原文提到 Kunpeng 950、920 New Type 和未來的型號。
- **silicon（矽晶片）合作**：作業系統廠商和晶片廠商合作，讓作業系統在特定處理器上事先驗證、最佳化。原文的標籤列有 Silicon Partner Program，但內文沒有說明這個計畫的內容。
- **inference（推論）**：把訓練好的 AI 模型拿來實際回答問題、做判斷的階段。原文說映像檔的設計目標包含高並行、高精度與高吞吐量的推論。
- **Ubuntu Pro**：Canonical 的訂閱服務，提供安全維護與支援。本站之前的〈[Ubuntu Pro 在 AWS 上的升級](../ubuntu-pro-aws-upgrade/)〉介紹過它的使用方式。

### 2. 值得注意的地方：預先驗證好的軟硬體組合

原文講的重點是「整合與驗證」：Canonical 會在事前把軟體和 Kunpeng 硬體搭在一起驗證，客戶不用自己處理複雜的設定，就能從測試走到正式上線。這個說法是原文的主張，我沒有看到實際的驗證項目或測試報告。

另一個值得注意的是支援範圍。原文說客戶可以買 Ubuntu Pro，涵蓋 Ubuntu、Canonical OpenStack、MicroCloud、Kubernetes 和 Ceph，支援最長 15 年。對電信業者與企業機房來說，這代表從作業系統到雲端平台、儲存都可以用同一份訂閱處理。

### 3. 可以怎麼看這則消息

這是一篇合作公告，語氣偏宣傳，沒有技術細節。我會先把它當成「Ubuntu 在 Kunpeng 上會有官方支援的路線」，等實際的映像檔與文件出來再評估。本站目前沒有用過 Kunpeng 硬體，無法驗證原文的效能說法。

### 4. 還有哪些疑問

> **待確認**：原文只說映像檔「將會」設計成高並行、高吞吐的推論，沒有說明什麼時候開始提供、怎麼取得，也沒有說明對應哪一個 Ubuntu 版本。

> **待確認**：原文沒有說明這個最佳化映像檔和一般的 Ubuntu arm64 映像檔差在哪裡，例如是 kernel 設定、驅動程式還是套件的差異。

> **待確認**：「最長 15 年」需要什麼訂閱條件，以及 Kunpeng 上的 Ubuntu Pro 怎麼購買，原文沒有說明。

## 原文精華導讀

### 背景

2026 年 11 月 18 日，Canonical 與華為鯤鵬運算部門（Huawei Kunpeng Computing Business）宣布策略合作，要為 Kunpeng 處理器提供最佳化的企業級 Ubuntu 映像檔，結合鯤鵬的運算架構與 Canonical 的開源軟體生態，目標是加速雲端現代化、AI 創新與數位轉型。

### 合作內容

| 項目 | 原文的說明 |
| --- | --- |
| 最佳化的 Ubuntu 映像檔 | 設計目標是高並行、高精度與高吞吐量的推論，適用 Kunpeng 950、920 New Type 與未來的 Kunpeng 晶片 |
| Ubuntu Pro | 客戶可以購買，取得 Ubuntu、Canonical OpenStack、MicroCloud、Kubernetes 與 Ceph 的安全維護與支援 |
| 支援期限 | 最長 15 年，讓企業與電信業者建置安全設計、新一代的資料中心 |
| 預先整合與驗證 | 事先整合並驗證軟硬體堆疊，讓組織跳過複雜的設定，提供開箱即用的體驗 |
| 共同行銷 | 共同舉辦產業活動，並支援 Kunpeng 開發者生態系 |

### 雙方的說法

- Canonical 聯盟與垂直市場副總裁 Ivan Ramos Garza 表示，這不只是提供作業系統，而是為 AI 與雲原生基礎架構提供經過認證、最佳化的基礎，並期待共同開發與共同創新。
- 華為鯤鵬運算部門認為這是 Kunpeng 運算生態系的重要催化劑，Kunpeng 950 與 920 New Type 處理器是為新一代資料中心的嚴苛需求設計，搭配 Ubuntu 的正式環境可以帶來更多價值。

### 出處

- 原文：[Canonical and Huawei Kunpeng announce collaboration to deliver optimized Ubuntu and Ubuntu Pro on Kunpeng hardware](https://canonical.com/blog/canonical-huawei-kunpeng-announce-collaboration-optimized-ubuntu)（Jonathan Mok，Canonical Blog，2026 年 11 月 18 日）
