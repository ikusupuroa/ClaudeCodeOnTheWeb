# Snap (Canonical Snap 封裝生態與邊緣運算架構模組)

## 1. 核心定位
本目錄專注於研究與探討 Canonical 官方核心開源技術 **Snap 封裝生態系統（Snap Ecosystem）**。
涵蓋應用封裝（Snaps）、底層服務守護行程（`snapd`）、打包建構框架（Snapcraft）、安全沙盒隔離機制（Confinement & Interfaces）、多通道版本控管（Channels）、以及 Snap 在 **Ubuntu Core** 與 **IoT / Edge（物聯網與邊緣運算）** 領域的關鍵架構（事務性更新 Transactional Updates、Delta 增量更新、零停機自動回滾）。

- **官方首頁**：[Snapcraft - The app store for Linux](https://snapcraft.io/)
- **官方文檔**：[Snapcraft Documentation](https://snapcraft.io/docs/)
- **關於介紹**：[About Snapcraft](https://snapcraft.io/about)
- **IoT 專區**：[Snaps for IoT & Embedded](https://snapcraft.io/iot)

## 2. 職責邊界
- **涵蓋範圍**：
  - **Snap 核心架構**：SquashFS 唯讀壓縮映像檔掛載、版本歷程（Revisions）與切換原理。
  - **安全性與沙盒隔離（Confinement）**：`strict`、`classic`、`devmode` 三大隔離級別，AppArmor、Seccomp、cgroups、Namespaces 整合。
  - **介面連線機制（Interfaces）**：Plugs（插頭）與 Slots（插槽）宣告、連線管理（`snap connect` / `disconnect`）與權限治理。
  - **更新管理與通道體系（Channels）**：Tracks（軌道）、Risk levels（`stable`、`candidate`、`beta`、`edge`）、Branches（分支）、排程更新與微增量更新（Delta updates）。
  - **IoT 與 Ubuntu Core 深度整合**：不可變作業系統（Immutable OS）、原子事務性更新（Transactional Updates）、斷電保護與自動回滾（Automatic Rollback）、Ubuntu Frame 與機器人（ROS）生態。
  - **建構與分發框架（Snapcraft & Store）**：`snapcraft.yaml` 規格、套件構建、公開 Snap Store 與企業專屬 Brand Store。
- **排除範圍**：
  - 傳統 Debian APT / `.deb` 二進位套件維護（歸屬底層系統維運）。
  - 獨立 CVE 弱點通告與掃描指令（歸屬 `UbuntuCVEs/` 或 `UbuntuProClient/`）。
  - LXD 系統容器與虛擬機器排程（歸屬 `LXD/`）。

## 3. 主要檔案清單
- `README.md`：本目錄工作說明與職責定位。
- `01_SNAP_ARCHITECTURE_AND_ECOSYSTEM.md`：【第一部曲】Canonical Snap 技術全貌與生態體系解析（淺入深出實戰導向版：採用「白話說明 ➜ 終端機實作」交替編號結構，涵蓋四大支柱、唯讀掛載、插頭插槽權限治理、通道回滾、IoT/Ubuntu Core 核心價值、四大封裝技術對照、以及 Control Plane 與 Data Plane 解耦之系統容錯與 snapd 停止實機壓力測試）。
- `02_NEXTCLOUD_SNAP_PRACTICE.md`：【第二部曲】Nextcloud 完整實戰教學（經 Ubuntu 實機驗證通過：含 Port 10081 自訂、UFW 防火牆動態開關、官方 Trusted Domains 配置、舊版指定安裝、跨通道升級、一鍵回滾、以及殘留快照 Snapshot 徹底銷毀與避坑手記）。
- `03_SNAPCRAFT_BUILD_YOUR_OWN_SNAP.md`：【第三部曲】從零打包自製 Snap 套件實戰指南（以「復古像素貪食蛇 Web 遊戲」為核心案例：逐行剖析 snapcraft.yaml 藍圖、dump 外掛、stage-packages 最小 Python 堆疊打包、嚴格沙盒 network-bind 宣告、--dangerous 本機安裝測試、升級至 daemon 背景服務與徹底清除）。

## 4. 適用對象與情境
當對話涉及 Snap 容器化套件架構、Linux 跨發行版部署與分發策略、沙盒權限治理、IoT 邊緣裝置 OTA 不中斷更新設計、或 Ubuntu Core 系統規劃時，產出與維護皆歸屬於本目錄。
