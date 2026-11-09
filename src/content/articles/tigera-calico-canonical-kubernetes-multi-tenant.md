---
title: Tigera 與 Canonical 合作：Calico 網路安全加上 Canonical Kubernetes，做多租戶 K8s
pubDate: 2026-11-09
canonicalTitle: Tigera and Canonical partner to deliver resilient multi-tenant Kubernetes across cloud, on-premises, and edge
canonicalUrl: https://canonical.com/blog/tigera-and-canonical-partner-on-multi-tenant-k8s
canonicalAuthor: Canonical
canonicalPubDate: 2026-11-09T15:51:14Z
sourceFeed: Canonical Blog
summary: Tigera（Calico 的開發公司）與 Canonical 宣布合作，把 Canonical Kubernetes、Ubuntu Pro 和 Calico 的網路與網路安全層組成一套參考架構，讓企業在公有雲、地端虛擬機與邊緣環境跑多租戶 Kubernetes；作業系統與 Kubernetes 最長支援 15 年，兩層都有商業支援。
takeaway: 多個團隊共用 Kubernetes 叢集時，網路規則由誰設定是治理上的難題。這篇的重點是 Calico 的 policy tiers（政策分層）：平台團隊定好整體的防護規則，各租戶在範圍內自己管理。我還想知道的是，這套參考架構實際要去哪裡拿、需不需要 Calico 的商業版。
tags:
  - Kubernetes
  - Security
  - Ubuntu Pro
---

## ikusupuroa 觀點

### 1. 先懂幾個名詞

- **多租戶（multi-tenant）**：多個團隊或客戶共用同一套 Kubernetes 叢集，彼此要隔離，不能互相看到或干擾。
- **CNI**（Container Network Interface，容器網路介面）：Kubernetes 用來接上網路功能的標準介面。**Calico** 是常見的開源 CNI 與網路政策（network policy）實作，由 Tigera 開發。
- **微分段（microsegmentation）**：把網路切成很小的區塊，每個工作負載之間的連線都要有規則允許。
- **零信任（zero trust）**：不因為「在內網」就信任一個連線，每次存取都要驗證、都要符合政策。
- **eBPF**：在 Linux kernel 裡執行小程式的機制，Calico 用它來處理封包與套用政策。
- **CNCF-compliant**：通過 CNCF（Cloud Native Computing Foundation，雲原生運算基金會）的 Kubernetes 相容性認證。

### 2. 值得注意的地方：網路政策的分工

原文的出發點是，企業自己拼湊 Kubernetes 平台時，作業系統、Kubernetes 發行版、網路安全層往往來自三家不同的廠商，結果是強化（hardening）的程度不一致、支援期限長短不一，而且網路政策在每個環境的行為都不一樣。

讀完後我覺得最值得注意的是 Calico 的 **policy tiers**（政策分層）。多租戶叢集常見的問題是：所有規則都由平台團隊集中管理，租戶要改一條規則就要開單等；全部交給租戶，又怕有人把不該開的連線打開。policy tiers 的做法是把「平台的防護規則」和「租戶自己的政策」分成不同層，平台團隊定好上層的範圍，租戶在範圍內自己管。Tigera 總裁在原文裡也說，多租戶 Kubernetes 沒有強的治理（governance）就會失敗。

Canonical 這一側，原文的說法是 Ubuntu 和 Canonical Kubernetes 都有最長 15 年的支援，相對於上游 Kubernetes 每個版本大約 14 個月的支援期長很多。

### 3. 可以怎麼看這則消息

這是一篇合作發表的新聞稿，原文沒有提供安裝步驟、架構圖或測試數據。我會先把它當成「這兩家的產品可以這樣搭配、兩邊都提供商業支援」的訊號，實際要用時再找雙方的技術文件。

> **本站補充**：Tigera 開發的 Project Calico 本身是開源專案，想先熟悉概念的話，可以從它的 Kubernetes 網路政策開始。

Canonical 在容器供應鏈這一側的做法（rocks 與 chiseled 容器映像檔），可以參考本站的〈[簡化 Kubernetes、管住 AI Agent](../kubernetes-ai-agents-kubecon-na-2026/)〉。

### 4. 還有哪些疑問

> **待確認**：原文說兩家提供一套「可重複使用的參考架構」（reference architecture），但沒有說明這份架構文件在哪裡發布、怎麼取得。

> **待確認**：原文列的 policy tiers、egress／ingress gateway、Cluster Mesh、威脅圖（threat graph）等功能，哪些在 Calico 開源版就有、哪些要用 Tigera 的商業版，原文沒有區分。

> **待確認**：「最長 15 年」需要什麼訂閱條件，原文沒有說明。

## 原文精華導讀

### 背景

2026 年 11 月 9 日，Tigera 與 Canonical 在聖荷西和倫敦同時宣布合作，要幫企業在公有雲、地端虛擬機與邊緣環境，執行有安全維護、符合法規、可多租戶的 Kubernetes。做法是把 Canonical 有支援的 CNCF 相容 Kubernetes 發行版，搭配 Calico 的網路與網路安全層，組成一套給企業用的藍圖（blueprint）。

原文認為，平台團隊自己拼湊作業系統、Kubernetes 和網路安全層，會造成三個問題：

| 問題 | 原文的說明 |
| --- | --- |
| 強化不一致 | 各層來自不同廠商，安全強化的做法不一 |
| 支援期限不一 | 每一層的支援時間長短不同 |
| 網路政策不一致 | 同一套政策在不同環境的行為不同 |

### Canonical 負責的部分：作業系統與 Kubernetes

- **Ubuntu Pro**：提供安全維護與長期支援，協助企業符合法規要求。
- **Canonical Kubernetes**：從單一節點到高可用的正式環境叢集都能部署，也可以用 Cluster API 自動化大規模部署與維運。
- **支援期**：Ubuntu 與 Canonical Kubernetes 都有最長 15 年的支援，上游 Kubernetes 大約是 14 個月。
- **chiseled 容器**：把同樣的安全與支援模式延伸到常用的程式語言執行環境（runtime）。

### Tigera 負責的部分：Calico 網路與網路安全

- **微分段**：以身分為基礎、Kubernetes 原生的微分段，可以大規模套用政策。
- **policy tiers**：平台團隊把政策管理委派給各租戶，但保有集中控制；平台的防護規則和租戶的政策分開，避免政策越來越多、越來越亂。
- **一致的模型**：虛擬機和容器、地端、邊緣和雲端都用同一套政策模型，透過單一管理介面管理，底層是高效能的 eBPF data plane（資料平面）。
- **出入口控管**：egress gateway 提供固定的對外 IP，對外流量可以稽核；ingress gateway 以 Kubernetes Gateway API 建置，可以整合 WAF（Web Application Firewall，網頁應用程式防火牆）；DNS 層的控管可以依名稱擋掉未授權的服務。
- **跨叢集**：Cluster Mesh 把不同站點、不同區域的叢集連起來。
- **可視性**：服務與威脅圖、內建儀表板、動態封包擷取，用來排查網路層的流量問題。

### 兩家合起來提供什麼

原文的結論列了四點：

1. 在共用叢集內或跨叢集都有強的租戶隔離，並集中治理。
2. 不論工作負載跑在哪裡，網路安全設定和可視性都一致。
3. 部署的穩定性跟著 Ubuntu LTS 的發布節奏。
4. 提供跨站點連接叢集的方法，用在高可用、搬遷與混合架構。

Tigera 與 Canonical 會在 2026 年 11 月 9–12 日於鹽湖城舉行的 KubeCon + CloudNativeCon North America 設攤。

### 出處

- 原文：[Tigera and Canonical partner to deliver resilient multi-tenant Kubernetes across cloud, on-premises, and edge](https://canonical.com/blog/tigera-and-canonical-partner-on-multi-tenant-k8s)（Canonical，Canonical Blog，2026 年 11 月 9 日）
