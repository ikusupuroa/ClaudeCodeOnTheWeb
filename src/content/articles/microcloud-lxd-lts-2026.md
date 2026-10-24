---
title: MicroCloud 3.4 與 LXD 6.10 LTS 釋出：多站點集中管理、跨叢集災難復原、直接接 SAN 儲存
pubDate: 2026-10-24
canonicalTitle: MicroCloud and LXD LTS releases now available
canonicalUrl: https://canonical.com/blog/microcloud-and-lxd-lts-releases-2026
canonicalAuthor: Miona Aleksic
canonicalPubDate: 2026-10-19T10:00:00Z
sourceFeed: Canonical Blog
summary: Canonical 釋出 MicroCloud 3.4.0 LTS（內含 LXD 6.10.0 LTS、MicroCeph Tentacle、MicroOVN 26.03，以 Ubuntu 26.04 LTS 為基礎），最長可獲 15 年安全維護。新功能包括多叢集集中管理的 Cluster Manager、跨叢集非同步複寫的災難復原、Entra ID 整合、OVN 負載平衡、直接串接 HPE、Pure Storage、Dell 的 SAN 儲存，以及 NVIDIA 與 AMD GPU 的 CDI 支援。
takeaway: 對正在重新評估虛擬化平台授權成本的台灣企業，以及在台灣、東南亞多地設廠、需要集中管理邊緣機房的製造業，這次 LTS 補上了幾個過去評估時常卡關的功能：多站點集中管理、跨叢集災難復原，以及直接沿用既有的 SAN 儲存設備。
tags:
  - Cloud
  - Virtualization
  - Kubernetes
---

## ikusupuroa 觀點

### 1. 誰該關注這次發布

**MicroCloud** 是 Canonical 的輕量私有雲方案，把 LXD（虛擬機與系統容器）、MicroCeph（分散式儲存）、MicroOVN（虛擬網路）整合在一起。以下是本站的觀察：

- **重新評估虛擬化平台的企業**：近年不少台灣企業因為商用虛擬化平台的授權與計價方式改變，開始評估替代方案。MicroCloud 與 LXD 是開源方案，這次 LTS 提供最長 15 年的安全維護，對重視長期穩定的企業有吸引力。
- **多地設廠的製造業**：台灣製造業常在台灣、中國、東南亞、美墨都有工廠，每個廠區都有自己的小機房。新的 **Cluster Manager** 可以在單一網頁介面集中管理多個站點的叢集，正好對應這種情境。

### 2. 這次補上的企業級功能

過去評估 LXD／MicroCloud 時，常見的疑慮是「企業功能夠不夠」。這次 LTS 針對幾個常見缺口做了補強：

| 企業常見需求 | 這次的對應功能 |
| --- | --- |
| 多站點集中管理 | MicroCloud Cluster Manager（已正式發布） |
| 災難復原 | LXD Replicators：跨叢集非同步複寫執行個體與儲存磁碟區 |
| 沿用既有儲存設備 | 原生整合 HPE Alletra、Pure Storage、Dell PowerStore，PowerStore 與 Pure Storage 支援 Fibre Channel |
| 企業身分整合 | 強化 OIDC，可整合 Microsoft Entra ID 等身分提供者 |
| 監控 | 透過 Juju charm 自動接上 Canonical Observability Stack |
| AI 運算 | NVIDIA 與 AMD GPU 的 CDI（Container Device Interface）支援 |

### 3. 評估時要留意的地方

以下是本站補充：

- **原文是功能公告，沒有效能數據與價格**。企業支援透過 Ubuntu Pro 提供，費用需要向 Canonical 詢價。
- **SAN 整合只列出三家**：如果現有儲存設備不是 HPE、Pure Storage 或 Dell 的這幾個系列，要先確認相容性。
- **從其他平台遷移**：LXD UI 新增了伺服器端的外部虛擬機映像檔轉換（QCOW2 與 VMDK），有助於把現有虛擬機搬過來，但大規模遷移仍建議先做小規模 PoC。

## 原文精華導讀

### 版本組成

MicroCloud 3.4.0 LTS 包含 **LXD 6.10.0 LTS**、**MicroCeph Tentacle**、**MicroOVN 26.03**，以 **Ubuntu 26.04 LTS** 為基礎，最長可獲得 15 年安全維護與企業支援。

### MicroCloud 新功能

- **MicroCloud Cluster Manager**：統一的網頁儀表板，集中探索、監控與設定所有 MicroCloud 叢集，可以加入新的邊緣站點、追蹤整體健康狀態。已正式發布（GA）。
- **Observability charm**：透過新的 Juju charm，自動把 MicroCloud 節點接上 Canonical Observability Stack（COS），提供集中化 Log、即時指標與自動告警，不需要自己寫腳本。

### LXD 新功能

LXD 是 MicroCloud 的核心虛擬化引擎，這次多數新功能來自 LXD：

- **災難復原**：內建 Replicators，跨叢集非同步複寫執行個體與儲存磁碟區；同時改進了 `lxd recover` 復原工具。
- **身分與存取管理**：以伺服器端工作階段強化 OIDC，可整合 Entra ID 等企業身分提供者；支援 bearer token 驗證、客體執行個體的服務帳號，以及細緻的存取控制。
- **自動合規**：Ubuntu Pro auto-attach 讓 LXD 客體執行個體自動繼承主機的 Ubuntu Pro 訂閱。
- **網路與負載平衡**：OVN 網路轉發與負載平衡器可自動分配 IP；支援 OVN 網路內部的負載平衡器；具健康檢查的後端集區會自動避開異常的執行個體。
- **企業儲存與 Kubernetes CSI**：原生整合 HPE Alletra、Pure Storage、Dell PowerStore（PowerStore 與 Pure Storage 支援 Fibre Channel）；新增專用的 Kubernetes CSI 驅動程式，讓在 LXD 中執行的 Kubernetes 叢集直接透過 `/dev/lxd` 管理永久磁碟區。
- **GPU**：採用 CDI 標準，完整支援 NVIDIA GPU（含內顯直通），並支援 AMD GPU 執行 ROCm 工作負載。
- **伺服器端映像檔來源**：映像檔來源改存在叢集資料庫中，網頁介面與 API 用戶端都能共用，不必在每台機器上手動設定。

### 網頁介面更新

新增災難復原、映像檔來源、OVN 負載平衡器、placement group 與叢集連結的操作流程；加入內嵌的檔案瀏覽器、虛擬機剪貼簿同步、伺服器端外部虛擬機映像檔轉換（QCOW2 與 VMDK）、更完整的叢集成員資訊與圖表，以及 YAML 設定編輯器。

### 出處

- 原文：[MicroCloud and LXD LTS releases now available](https://canonical.com/blog/microcloud-and-lxd-lts-releases-2026)（Canonical Blog，Miona Aleksic，2026-10-19）
- 文件：[MicroCloud](https://canonical.com/microcloud/docs)、[LXD 災難復原說明](https://canonical.com/lxd/docs/latest/explanation/disaster_recovery/)
- 原文提到 10 月 29 日有線上研討會，報名資訊請見原文。
