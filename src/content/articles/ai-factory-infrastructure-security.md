---
title: AI 上線之後才是開始：Canonical 談 AI 工廠（AI factory）的長期維護與安全
pubDate: 2026-11-03
canonicalTitle: How to build, maintain, and secure infrastructure for AI factories
canonicalUrl: https://canonical.com/blog/how-to-build-maintain-and-secure-infrastructure-for-ai-factories
canonicalAuthor: Ijlal Loutfi
canonicalPubDate: 2026-11-02T17:36:09Z
sourceFeed: Canonical Blog
summary: Canonical 用「AI 工廠」的概念說明：AI 上線後，作業系統、容器與應用程式相依套件各有自己的支援週期，企業要先想清楚誰來維護、安全更新怎麼送到正在跑的工作負載。原文依序介紹 Ubuntu Pro、Container Build Service、Rockcraft 與 Chisel、Charmed Kubeflow 與 Juju，以及機密運算（confidential computing）在這個架構中的角色。
takeaway: 這篇最值得記住的一句是：主機的作業系統更新了，容器裡自帶的 Python 函式庫不會跟著更新。AI 推論容器常常帶著自己的相依套件，主機全部修補完，映像檔裡的漏洞還在；機密運算也一樣，保護的是記憶體不被主機窺探，不會修好客體裡的漏洞。
tags:
  - AI
  - Security
  - Kubernetes
---

## ikusupuroa 觀點

### 1. 先定位：這是一篇產品組合介紹

原文是 Canonical 白皮書〈Secure your AI Infrastructure〉的導讀，依序介紹自家的產品怎麼對應 AI 基礎設施的維護需求，沒有實際部署步驟或數據。我把它當成一張「AI 環境裡有哪些東西需要維護」的地圖來讀，比較有收穫。

### 2. AI 工廠：硬體會比模型活得久

原文的出發點是：GPU 硬體可能會跨好幾代模型與框架持續使用，而作業系統、容器、應用程式相依套件各有自己的支援週期。所以 AI 上線不是一次性的專案，而是一份長期的維護責任，要先想清楚每一層由誰維護、安全更新怎麼送到已經部署的工作負載。

「AI 工廠」（AI factory）指的就是開發、訓練、提供模型服務的整套基礎設施與流程；模型會一直換，但建置系統、訓練流程與服務基礎設施是同一套，安全也要跟著一直維護。

### 3. 主機修好了，容器不一定

這是我覺得最實用的一點。推論容器可能帶著自己的 Python 函式庫與原生相依套件，**更新主機的作業系統不會動到這些副本**，所以可能出現「主機全部修補完、映像檔卻還有漏洞」的狀況。

這和本站之前讀過的幾篇安全公告是同一個道理：[php2shell](../php2shell-php-critical-vulnerability/) 提醒更新後要重啟服務，同一天的 [kernel 漏洞 CVE-2026-98432](../linux-kernel-cve-2026-98432-proposed/) 提醒裝完要重開機；容器則是要重新建置映像檔、重新部署。修補「裝了」和「生效了」之間，常常還差一步。後兩句的整理是本站補充。

原文對應的做法有兩層：

- **Container Build Service**：由 Canonical 客製建置容器，並維護其中相依套件的安全，包括 AI 與機器學習軟體。
- **Rockcraft 與 Chisel**：Rockcraft 用宣告式的方式建置以 Ubuntu 為基礎、符合 OCI（Open Container Initiative，開放容器標準）的映像檔；Chisel 只挑出應用程式需要的檔案，省略不必要的元件。

原文也提醒，企業還是要自己驗證、部署更新後的工作負載，Canonical 分擔的是底層的維護。

### 4. Charm 與 Juju 的意思

原文順帶解釋了 Canonical 產品名稱裡常見的「Charmed」：charm 是一個軟體 operator（自動化維運程式），裡面包含部署、設定、升級與整合某個應用程式的專屬程式碼；Juju 是 Canonical 的開源編排引擎，負責執行這些 operator，並協調應用程式之間的關係。所以 Charmed Kubeflow 就是「用 charm 包裝、由 Juju 維運的 Kubeflow」。之前讀 [KubeCon NA 2026 那篇](../kubernetes-ai-agents-kubecon-na-2026/)時看到 Charmed OpenShell，現在比較清楚名稱的由來。

### 5. 機密運算不能取代修補

原文介紹 Ubuntu 支援 Intel TDX 與 AMD SEV-SNP 的機密虛擬機器（confidential VM），用硬體隔離保護客體記憶體不被主機的 hypervisor（虛擬化管理程式）讀取，也支援搭配 NVIDIA H100 GPU。但原文特別強調：保護記憶體不等於修好客體裡作業系統或應用程式的漏洞，機密虛擬機器裡一樣需要安全維護。

### 6. 還有哪些疑問

> **待確認**：原文是白皮書的摘要，各元件怎麼組合、分別負責哪些安全責任，要讀白皮書本身才知道；本站目前只讀了這篇 Blog。

> **待確認**：原文提到 Livepatch 可以不重開機套用重大 kernel 安全修補，讓長時間的模型訓練不必中斷，但沒有說明哪些漏洞會提供 Livepatch，例如同一天公告的 CVE-2026-98432 是否涵蓋。

## 原文精華導讀

### AI 上線帶來長期維護責任

- GPU 基礎設施可能跨好幾代模型與框架持續服役，作業系統、容器與應用程式相依套件各有自己的支援週期。
- 企業採購時要先確立：這些元件由誰維護、安全更新怎麼送到已部署的工作負載。
- 「AI 工廠」涵蓋開發、訓練與提供模型服務的基礎設施與流程，安全需求貫穿整個上線後的生命週期。

### 在穩定與安全之間取得平衡

- AI 團隊需要新的框架與模型架構，但底層平台的變動（例如升級 Kubernetes、替換容器相依套件）會影響已經通過測試的正式環境工作負載。
- **Ubuntu Pro**：Canonical 的企業訂閱，提供安全維護與合規自動化，為作業系統與 Ubuntu 套件庫中的套件提供最長 15 年的安全修補，也涵蓋 Canonical 的基礎設施、AI 與資料相關軟體。
- **Livepatch**：不重開機就套用重大 kernel 安全修補，長時間的模型訓練工作不必中斷。
- **Ubuntu Security Guide（USG）**：套用並稽核 CIS 與 DISA-STIG 強化設定檔，證明每個環境符合同一套標準。
- **FIPS 140-3** 認證的加密模組，對應政府、金融與醫療的需求。

### 把維護延伸到 AI 容器

- 推論容器可能帶著自己的 Python 函式庫與原生相依套件，更新主機作業系統不會改變它們；主機全部修補完，應用程式映像檔仍可能有漏洞。
- **Container Build Service**：客製容器建置，並為相依套件（包括 AI 與機器學習軟體）提供安全維護，把維護範圍從主機延伸到隨工作負載出貨的軟體。
- **Rockcraft**：宣告式、以 Ubuntu 為基礎、符合 OCI 的映像檔建置。
- **Chisel**：只選取應用程式需要的檔案，省略不必要的元件；元件的中繼資料仍保留，可用來辨識映像檔內容。
- 企業仍要驗證與部署更新後的工作負載，但可以從 Canonical 取得有人維護的容器軟體，不必獨自承擔所有底層維護。

### 在有支援的基礎設施上運作模型流程

- **Charmed Kubeflow**：在 Kubernetes 上提供機器學習流程（pipeline），執行時記錄中繼資料，並可整合 **Charmed MLflow** 做實驗追蹤與模型管理。
- **Charm**：軟體 operator，包含應用程式專屬的部署、設定、升級與整合程式碼。
- **Juju**：Canonical 的開源編排引擎，執行 charm 並協調應用程式之間的關係，減少平台團隊自己開發整合腳本與維護程序的工作。
- Canonical Kubernetes 與 Charmed Kubeflow 為這些層級提供企業維護與支援，讓團隊在推到正式環境前先檢查相容性與效能。

### 保護敏感工作負載不受主機影響

- 有些部署需要防範有特權的主機軟體，這和維護套件、隔離 Kubernetes 工作負載是不同的需求。
- Ubuntu 支援使用 **Intel TDX** 與 **AMD SEV-SNP** 的機密虛擬機器，以硬體強制隔離保護客體記憶體不受主機 hypervisor 存取；支援的設定可搭配 **NVIDIA H100** GPU，把機密運算延伸到加速運算的 AI 工作負載。
- **遠端認證（remote attestation）**：在釋出敏感資料或金鑰之前，提供執行環境的證明供評估。
- 客體仍需要安全維護：保護記憶體不受主機存取，不會修好客體內作業系統或應用程式的漏洞。

### 結論

- AI 部署開始的維護責任，會隨著模型更替、新工作負載上線而持續；接續的模型都依賴同一套建置系統、訓練流程與服務基礎設施。
- Canonical 的產品組合以安全維護的套件與容器相依套件、Charmed 系列的維運自動化，以及機密運算來分擔這些工作，減少企業自己要承擔的軟體維護與整合工作。

### 出處

- 原文：[How to build, maintain, and secure infrastructure for AI factories](https://canonical.com/blog/how-to-build-maintain-and-secure-infrastructure-for-ai-factories)（Canonical Blog，Ijlal Loutfi，2026-11-02）
- 白皮書：[Secure your AI Infrastructure](https://assets.ubuntu.com/v1/57a2760f-secure_your_ai_infrastructure_whitepaper.pdf)
- 機密運算：[Ubuntu confidential computing](https://ubuntu.com/confidential-computing)
