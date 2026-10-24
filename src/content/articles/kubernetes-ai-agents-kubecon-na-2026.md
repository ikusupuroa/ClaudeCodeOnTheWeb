---
title: 簡化 Kubernetes、管住 AI Agent：Canonical 在 KubeCon NA 2026 要展示的四個情境
pubDate: 2026-10-24
canonicalTitle: Simplify your enterprise kubernetes and govern your AI agents with Canonical
canonicalUrl: https://canonical.com/blog/simplify-your-enterprise-kubernetes-and-govern-your-ai-agents-with-canonical
canonicalAuthor: Mita Bhattacharya
canonicalPubDate: 2026-10-21T10:00:00Z
sourceFeed: Canonical Blog
summary: Canonical 預告將在 KubeCon NA 2026 展示四個情境：用 Charmed OpenShell 管理大量 AI Agent、以本機推論與 OpenAI 相容 API 讓 AI 應用可以更換模型、在防火牆內建置完整 MLOps，以及用強化過的 rocks 容器映像檔保護軟體供應鏈，底層都是 Canonical Kubernetes 與 MicroCloud。
taiwanTakeaway: 對想把生成式 AI 留在自家機房的台灣金融、製造與公部門，這篇最實用的是「模型可替換」的架構思路：應用程式透過 OpenAI 相容 API 呼叫本機模型，模型換供應商或搬回地端時，不必大改程式；至於 AI Agent 治理，Charmed OpenShell 目前仍是 alpha，適合先觀察、別急著上正式環境。
tags:
  - Kubernetes
  - AI
  - Cloud
---

## 🇹🇼 台灣觀點點評

### 1. 先定位：這是一篇展覽預告

這篇是 Canonical 為 KubeCon NA 2026（11 月 10 日至 12 日，美國鹽湖城）預告展示內容的文章，帶有行銷性質。台灣讀者不太可能到現場，但四個展示情境剛好對應台灣企業導入生成式 AI 時最常卡關的問題，值得拆開來看。

### 2. 最值得參考：讓 AI 應用可以換模型

台灣的金融、醫療、製造業與公部門，常因為資料不能出境、個資或營業秘密考量，無法直接使用公有雲的大型語言模型。但如果一開始就把程式綁死在某一家雲端模型的 API 上，之後要換模型或搬回地端，就得大改程式。

Canonical 提出的架構是：

- 用 **inference snaps** 在本機執行開源模型，對外提供 **OpenAI 相容 API**。
- 應用程式依照 **12-factor** 原則，把「用哪個模型」當成設定，而不是寫死在程式裡。
- 結果是切換相容的模型或推論供應商時，需要改的程式碼變少。

這個思路不限於 Canonical 的產品。即使採用其他平台，「應用程式只認 OpenAI 相容 API，模型可替換」都是台灣企業規劃 AI 架構時值得採用的原則（本站補充）。

### 3. AI Agent 治理：方向對，但產品還早

原文提到，企業若在同一套基礎設施上同時執行核心業務與成百上千個 AI Agent，沒有防護措施的話，失控的 Agent 可能逸出到正式環境。Canonical 的解法是 **Charmed OpenShell**，在沙箱中執行 Agent 並套用政策管控。

需要注意的是，Charmed OpenShell **目前是 alpha 版本**。對台灣企業的建議是：先在概念驗證（PoC）環境評估，正式環境的 Agent 治理仍要搭配既有的權限控管與網路隔離。

### 4. 容器供應鏈：rocks 對有資安稽核需求的團隊有幫助

原文介紹的 **rocks** 是 Canonical 強化過、符合 OCI 標準的容器映像檔：只包含需要的套件，同時保留讓弱點掃描準確判讀的中繼資料。對常被弱點掃描報告「一堆 CVE 雜訊」困擾的台灣團隊，這是值得評估的方向。

> 原文引用「62% 的組織表示 Kubernetes 的複雜度正在拖慢業務計畫」，這個數字出自 Red Hat 的 Kubernetes 調查報告，並非 Canonical 自己的調查。

## 原文精華導讀

### 背景

企業被要求快速且安全地擴大 AI 應用，但過於複雜的 AI 基礎設施會延誤計畫、侵蝕商業價值，Kubernetes 常是原因之一。**Canonical Kubernetes** 主打符合上游標準、簡化的生命週期管理與長期安全維護，可以在公有雲、私有基礎設施與邊緣環境一致地執行工作負載。

### 四個展示情境

| 情境 | 要解決的問題 | Canonical 的做法 |
| --- | --- | --- |
| 大規模治理 AI Agent | 成百上千個 Agent 與核心業務共用基礎設施，缺乏防護時可能失控 | MicroCloud + Canonical Kubernetes + Charmed OpenShell（alpha），在沙箱中執行 Agent 並套用政策 |
| AI 可攜性 | AI 應用綁死單一雲端模型供應商，換模型或搬回地端要大改程式 | MicroCloud 提供私有雲，inference snaps 以 OpenAI 相容 API 執行開源模型，Juju 自動化維運，模型成為可替換的設定 |
| 端到端 MLOps | 訓練與部署自訂模型的基礎設施複雜，常被綁在昂貴的公有雲 API | Canonical Kubernetes 搭配 Charmed AI 元件，在防火牆內運作；展示 llm-d（以 vLLM 為基礎）分離 prefill 與 decode 階段，並現場測試故障自癒 |
| 軟體供應鏈安全 | 現成映像檔不合用、肥大映像檔 CVE 雜訊多、一般 distroless 映像檔可能有資安盲點 | rocks：強化、符合 OCI 標準的映像檔，只含必要套件並保留掃描所需中繼資料，可用開源工具自行建置 |

### 結論

原文認為，IT 決策者的課題已經不是「要不要導入 Kubernetes」，而是「如何大規模掌控 Kubernetes」。Canonical Kubernetes 的賣點包括：以 snap 為基礎的低維護更新、透過 Juju 自動化 Day 2 維運，以及 LTS 版本長達 15 年的穩定支援。

### 出處

- 原文：[Simplify your enterprise kubernetes and govern your AI agents with Canonical](https://canonical.com/blog/simplify-your-enterprise-kubernetes-and-govern-your-ai-agents-with-canonical)（Canonical Blog，Mita Bhattacharya，2026-10-21）
- 相關產品：[Canonical Kubernetes](https://ubuntu.com/kubernetes)、[MicroCloud](https://canonical.com/microcloud)、[Charmed OpenShell alpha 發布公告](https://canonical.com/blog/charmed-openshell-alpha-release)、[Inference snaps 文件](https://documentation.ubuntu.com/inference-snaps/)
