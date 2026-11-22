---
title: MAAS 3.8 成為第一個 LTS 版：裸機管理平台最長 15 年支援，企業能少升幾次級
pubDate: 2026-11-22
canonicalTitle: 15 years of long term support for bare metal automation with MAAS
canonicalUrl: https://ubuntu.com/blog/15-years-of-long-term-support-for-bare-metal-automation-with-maas
canonicalAuthor: David Beamonte
canonicalPubDate: 2026-11-22T10:30:00Z
sourceFeed: Ubuntu Blog
summary: Canonical 的裸機（bare metal）自動化平台 MAAS 在 3.8 版推出第一個長期支援（LTS）版本，最長 15 年安全維護與企業支援。原文主張：這能讓 AI、HPC、5G 與關鍵基礎設施的團隊，不必為了軟體停止支援而升級管理平台，並讓 Canonical 基礎設施堆疊的每一層都有 LTS。3.8 也新增 OIDC 單一登入、ReBAC 權限控管、部署腳本與 FIPS 準備。
takeaway: 這篇最值得看的是它把硬體與軟體的壽命對起來：伺服器和加速器的投資以年計算，管理這些機器的平台卻常常幾年就要升級。MAAS 有了 LTS，企業可以決定自己什麼時候升級，而不是被停止支援的日期推著走。不過原文沒有說明「最長 15 年」的取得條件，評估時要先問清楚。
tags:
  - Cloud
  - Security
  - Ubuntu
---

## ikusupuroa 觀點

### 1. 先懂幾個名詞

- **MAAS**（Metal as a Service，裸機即服務）：Canonical 的開源平台，把實體伺服器的探索、檢測（commissioning）、安裝作業系統和重新分配，做成像雲端一樣可以用 API 操作的流程。
- **bare metal**（裸機）：沒有經過虛擬化、直接在實體伺服器上執行的環境。
- **LTS**（Long Term Support，長期支援）：版本的支援期限特別長，通常只收安全修補與錯誤修正，不做大幅改版。
- **CapEx**（Capital Expenditure，資本支出）：買設備、蓋機房這類一次性的大額投資。
- **IaC**（Infrastructure as Code，基礎設施即程式碼）：用程式碼描述並重複建立基礎設施。
- **OIDC**（OpenID Connect）、**SSO**（Single Sign-On，單一登入）、**ReBAC**（Relationship-Based Access Control，以關係為基礎的存取控制）、**FIPS**（美國的密碼模組安全標準）：3.8 新增功能裡會出現的名詞，後面再說明。

### 2. 值得注意的地方：硬體壽命和管理軟體壽命對不起來

原文的出發點很具體：蓋 AI 叢集、5G 網路、HPC 機房都是大額資本支出，規劃時間以年計；但負責佈建與管理實體伺服器的軟體，支援週期往往短得多。升級管理平台要做規劃、相容性測試，還要和其他元件協調，在大型環境裡會吃掉不少工程人力。

MAAS 3.8 的做法，是推出第一個 LTS 版，最長 15 年的安全維護，並沿用 Ubuntu LTS 的承諾（原文連到 Ubuntu LTS 擴充到 15 年的那篇公告）。原文的說法是，這讓企業可以降低「因為停止支援而被迫升級」的頻率，照自己的營運節奏安排升級。

### 3. 對企業的好處分析

原文把好處分散在各段，我整理成下表。「原文依據」欄是原文的說法，不是我實測的結果；「最適合的情境」欄是本站依原文列出的場景歸納的。

| 好處 | 原文依據 | 最適合的情境 |
| --- | --- | --- |
| 少做被停止支援逼出來的升級 | 延長的支援週期讓企業「減少主要由停止支援期限驅動的大版本升級」 | 管理平台升級要經過測試、審批、停機協調的環境 |
| 硬體可以照自己的步調換 | 團隊可以繼續汰換硬體、擴充容量，不必同步更換底下的管理平台 | AI 與 HPC 叢集，常常同時管理多個世代的伺服器與加速器 |
| 整個堆疊的支援期可以對齊 | MAAS 加入後，Canonical 基礎設施堆疊的主要元件都有 LTS：MAAS、Ubuntu、OpenStack、MicroCloud、Ceph、Canonical Kubernetes、Juju | 想把裸機、虛擬化、儲存、容器平台一起規劃生命週期的企業 |
| 單一供應商，維護與升級好協調 | 不必為每個元件各訂一套支援策略，可以和同一家廠商協調維護、安全更新與升級 | 人力有限、不想同時對接多家廠商的 IT 團隊 |
| 比較容易符合法規與資安要求 | 減少頻繁升級，有助於關鍵服務維持穩定營運，並支援資安與法規要求；3.8 另外擴充安全稽核紀錄，也預先做了 FIPS 準備 | 金融、電力這類變更需要長時間測試與正式核准的產業 |

原文列了三類最能受惠的場景：

- **AI 與 HPC**：叢集常常橫跨多個世代的伺服器與加速器，有長期支援的裸機控制平面，才能一邊擴充一邊維持一致的佈建流程。
- **電信與 5G**：基礎設施變更要大量驗證與協調，支援週期拉長，比較容易配合網路升級計畫。
- **關鍵基礎設施**：電力與金融機構的管理平台變更要經過測試和正式核准，少一次被迫升級，就少一次中斷服務的風險。

這幾項說的其實是同一件事：升級的時間由企業自己決定，不是由停止支援的日期決定。

> **本站補充**：評估時可以先問自己三件事：現有的 MAAS 或裸機管理平台，下一次被迫升級是什麼時候；升級一次要花多少測試與協調的人力；以及機房裡有沒有超過一個世代的硬體。這是本站整理的檢查角度，不是原文的內容。

### 4. 3.8 還新增了什麼

原文另外列了幾項改善，重點放在資安與存取管理：

- **OIDC 整合**：MAAS 可以接外部的 OIDC 身分提供者，做 SSO 與集中的使用者驗證。
- **ReBAC**：新的授權框架，用使用者、群組與資源權限（entitlement）做更細的存取控制。
- **部署腳本**：安裝作業系統之前或之後，可以自動執行自訂腳本，例如先套用韌體或 BIOS 設定、準備附加硬體（原文舉的例子是燒錄 DPU），不必把這些邏輯塞進自訂映像檔。
- **FIPS 準備與稽核紀錄**：3.8 納入 3.7.4 的 FIPS 相關改進，等 Ubuntu 26.04 LTS 有符合 FIPS 的 kernel 之後，就能以 FIPS 相容的方式運作；同時擴充了驗證與授權事件的稽核紀錄。

### 5. 還有哪些疑問

> **待確認**：原文說「最長 15 年」並連到 Ubuntu LTS 的 15 年公告，但沒有說明 MAAS 要什麼訂閱條件才拿得到，也沒有說明 15 年是怎麼分段計算的。

> **待確認**：原文只說 3.8 是第一個 LTS 版，沒有說明 3.8 之前的 MAAS 版本還支援多久，也沒有說明從舊版升級到 3.8 的路徑。

> **待確認**：FIPS 相容運作要等 Ubuntu 26.04 LTS 的 FIPS kernel，原文沒有說明預計什麼時候提供。

## 原文精華導讀

### 問題：長期投資配上短週期的軟體

- 建構 AI 超級運算叢集、部署 5G 電信網路、營運 HPC 資料中心，都需要大額資本支出，管理這些設施的平台常常要跨越多個硬體世代。
- 但佈建與管理實體伺服器的軟體，支援週期通常短得多，造成長期投資與軟體平台之間的落差。
- 升級或更換平台，要做規劃、相容性測試，並和其他基礎設施元件協調，大型環境裡會消耗大量工程資源。

### MAAS 的 15 年支援

- MAAS 是開源平台，讓實體基礎設施有類似雲端的自動化：集中管理裸機，從硬體探索、檢測、安裝作業系統到重新分配，整個生命週期都能自動化，也能透過 API 與 IaC 工具管理大量伺服器。
- MAAS 3.8 推出第一個 LTS 版，提供最長 15 年的安全維護、可預期的營運穩定性與企業支援，沿用 Ubuntu LTS 的承諾。
- 原文認為這讓組織可以更長時間維持穩定的裸機管理平台，並依營運需要安排基礎設施升級，同時在適用的支援期間內持續拿到安全更新。

### 整個堆疊都有 LTS

- 裸機自動化是上層平台的基礎：作業系統、虛擬化、儲存與容器編排，各層有各自的軟體週期，支援期不同會增加複雜度。
- 原文說 MAAS 加入後，Canonical 基礎設施堆疊的主要元件都有 LTS：

| 層級 | 元件 |
| --- | --- |
| 裸機佈建 | MAAS |
| 作業系統 | Ubuntu |
| 雲端基礎設施 | OpenStack、MicroCloud |
| 儲存 | Ceph |
| 容器編排 | Canonical Kubernetes |
| 應用程式部署與生命週期 | Juju |

- 原文認為，這讓組織可以對齊整個堆疊的支援週期，用單一供應商協調維護、安全更新與平台升級。

### MAAS 3.8 的其他更新

| 項目 | 原文的說明 |
| --- | --- |
| OIDC 整合 | 接外部 OIDC 身分提供者，做 SSO 與集中驗證 |
| ReBAC | 以使用者、群組與資源權限做更細的存取控制 |
| 部署腳本 | 作業系統安裝前後執行自訂腳本，每台部署的機器都會執行，讓整個機群行為一致 |
| FIPS 準備與稽核 | 納入 3.7.4 的 FIPS 改進；擴充驗證與授權事件的稽核紀錄 |

### 結論

原文的結論是：硬體與工作負載會演進，基礎設施團隊需要能提供持續性與可靠性的管理平台。有了最長 15 年的支援，MAAS 讓組織可以在多個硬體世代之間維持受支援的裸機控制平面，減少只因為軟體停止支援就要升級的壓力。

### 出處

- 原文：[15 years of long term support for bare metal automation with MAAS](https://ubuntu.com/blog/15-years-of-long-term-support-for-bare-metal-automation-with-maas)（David Beamonte，Ubuntu Blog，2026 年 11 月 22 日）
- 原文提到的延伸閱讀：[MAAS 3.8 release notes](https://canonical.com/maas/docs/release-information/release-notes/)、[Ubuntu LTS 擴充到 15 年的公告](https://ubuntu.com/blog/canonical-expands-total-coverage-for-ubuntu-lts-releases-to-15-years-with-legacy-add-on)、[FIPS 環境中的 MAAS 裸機自動化](https://ubuntu.com/blog/automating-bare-metal-infrastructure-in-fips-regulated-environments-with-maas)
