---
title: 第 2 章：切換通道、回滾，以及 snapd 停掉時會怎樣
pubDate: 2026-11-05
summary: 用 Caddy 練習從 stable 切到 edge 再回滾，確認資料目錄跟著 revision 切換、內容沒有遺失；用 snap changes 與 snap tasks 看回滾背後的步驟；停掉 snapd 測試 LXD 與容器會不會中斷；最後用 Multipass 開一台 Ubuntu Core 虛擬機，看全部由 Snap 組成的系統。
product: Snap
tags:
  - Snap
  - Ubuntu
  - Ubuntu Core
  - LXD
environment:
  - Ubuntu 26.04 LTS（kernel 7.0.0-42-generic、amd64）
  - snapd 2.77.1
  - Caddy（stable Rev 708／v2.11.7、edge Rev 722／v2.11.8）
  - LXD 6.10.1（3 個執行中的容器）
  - Multipass、Ubuntu Core 22 虛擬機
references:
  - title: Snapcraft Documentation
    url: https://snapcraft.io/docs/
  - title: Ubuntu Core documentation
    url: https://documentation.ubuntu.com/core/
  - title: Inside Ubuntu Core
    url: https://documentation.ubuntu.com/core/explanation/core-elements/inside-ubuntu-core/
  - title: Snaps for IoT & Embedded
    url: https://snapcraft.io/iot
---

> **僅供學習參考。** 這是我在自己的 Ubuntu 主機上的學習紀錄，不是 Canonical 官方文件。

## 前情提要

- **上一章完成了**：認識 Snap 的四個元件，用 `lsblk` 看到每個 Snap 以唯讀方式掛載在 `/snap/<套件名>/<revision>/`、`current` 符號連結指向目前的 revision，也實際拔掉、插回 Firefox 的相機權限。
- **這一章要處理**：用 Caddy 練習切換通道與回滾，確認資料有沒有跟著保留；看 `snap changes` 記錄了哪些操作；停掉 snapd，測試正在跑的服務會不會受影響；最後開一台 Ubuntu Core 虛擬機，看全部由 Snap 組成的系統長什麼樣子。

## 技術文件導讀與實作

### 通道（channel）的結構

傳統上想試某個軟體的 beta 版，常要另外加 PPA 或換軟體來源。Snap 把不同成熟度的版本放在不同的通道，格式是 `track/risk`：

- **track（軌道）**：大版本，例如 Nextcloud 的 `27`、`28`，或是 `latest`。
- **risk（風險等級）**：由穩定到實驗依序是 `stable`、`candidate`、`beta`、`edge`。

| risk | 用途 |
| --- | --- |
| `stable` | 正式版 |
| `candidate` | 準備發布的候選版 |
| `beta` | 功能開發完成、還在測試的版本 |
| `edge` | 最新原始碼自動建置的版本 |

### 實作：用 Caddy 練習切換通道與回滾

這一節用輕量的 Web 伺服器 Caddy，確認三件事：切換通道後版本有沒有變、資料有沒有保留、回滾後能不能回到原本的狀態。

#### 步驟 A：安裝 stable 版，在資料目錄寫入測試檔

每個 Snap 都有自己的資料目錄 `/var/snap/<套件名>/current/`。安裝 Caddy 後，在這裡放一個測試檔和 Caddyfile（監聽 8085）：

```bash
sudo snap install caddy
echo "【鐵證】這是 Caddy 在 Rev 708 版本留下的核心資料！" | sudo tee /var/snap/caddy/current/caddy_data.txt
```

```bash
sudo tee /var/snap/caddy/current/Caddyfile << 'EOF'
:8085 {
    root * /var/snap/caddy/current
    file_server
}
EOF
```

在背景啟動 Caddy，用 `curl` 讀測試檔，再看目前的版本：

```bash
sudo caddy start --config /var/snap/caddy/current/Caddyfile
curl http://localhost:8085/caddy_data.txt
sudo caddy version
```

`curl` 讀到剛才寫入的內容：

```text
【鐵證】這是 Caddy 在 Rev 708 版本留下的核心資料！
```

`caddy version` 顯示執行檔在 `/snap/caddy/708/usr/bin/caddy`，hash 是 `72dd0fb067f6d7826c7f79907670ba4a713bfe37`。

#### 步驟 B：切換到 edge（Rev 722）

先停掉 Caddy，再切換通道，切完重新啟動：

```bash
sudo caddy stop
sudo snap refresh caddy --channel=edge
sudo caddy start --config /var/snap/caddy/current/Caddyfile
```

> **待確認**：素材提到「Caddy 沒停就更新，snapd 會拒絕更新」，這次是先停掉才更新，沒有實測不停的情況，也還沒查到官方文件的說明。

再檢查版本與資料：

```bash
sudo caddy version
curl http://localhost:8085/caddy_data.txt
```

執行檔路徑變成 `/snap/caddy/722/usr/bin/caddy`，hash 也變成 `55996dfe05c10bb616ccdcc9bf5b8407a5be75b7`；`curl` 仍然讀得到步驟 A 寫入的內容，資料跟著帶到新的 revision。

#### 步驟 C：回滾（revert）

```bash
sudo caddy stop
sudo snap revert caddy
sudo caddy start --config /var/snap/caddy/current/Caddyfile
```

`snap revert` 執行後，Caddy 回到 v2.11.7（Rev 708）。再檢查一次：

```bash
sudo caddy version
curl http://localhost:8085/caddy_data.txt
```

三個階段的結果：

| 階段 | Revision | 執行檔路徑 | Hash | 測試檔 |
| --- | --- | --- | --- | --- |
| 安裝 stable | 708 | `/snap/caddy/708/usr/bin/caddy` | `72dd0fb0…` | 讀得到 |
| 切到 edge | 722 | `/snap/caddy/722/usr/bin/caddy` | `55996dfe…` | 讀得到 |
| revert | 708 | `/snap/caddy/708/usr/bin/caddy` | `72dd0fb0…` | 讀得到 |

回滾之所以快，是因為舊的 Rev 708 映像檔沒有被刪掉，`revert` 把 `/snap/caddy/current` 指回 708；`/var/snap/caddy/current` 也一起指回 708 的資料目錄，所以讀到的是當時的狀態。

> **待確認**：「資料目錄依 revision 分開存放、更新時複製一份到新 revision」是素材的說明，和這次的實測結果相符，但還沒查到官方文件確認。

#### 步驟 D：移除

```bash
sudo caddy stop
sudo snap remove caddy --purge
ls /var/snap/caddy
```

加上 `--purge` 移除時不會留下資料快照，`ls` 回應 `No such file or directory`，資料目錄已經刪掉。不加 `--purge` 會怎樣，第 3 章用 Nextcloud 實際示範。

### 看 snapd 做過哪些事：snap changes

```bash
snap changes
```

```text
ID   Status  Spawn               Ready               Summary
42   Done    today at 15:41 CST  today at 15:42 CST  Install "nextcloud" snap from "27/stable" channel
45   Done    today at 20:22 CST  today at 20:23 CST  Refresh "nextcloud" snap from "28/stable" channel
46   Done    today at 20:25 CST  today at 20:25 CST  Revert "nextcloud" snap
47   Done    today at 20:27 CST  today at 20:28 CST  Remove "nextcloud" snap
48   Done    today at 20:29 CST  today at 20:29 CST  Forget of snapshot set #5
51   Done    today at 20:50 CST  today at 20:50 CST  Disconnect : from firefox:camera
52   Done    today at 20:50 CST  today at 20:50 CST  Connect firefox:camera to snapd:camera
56   Done    today at 21:01 CST  today at 21:01 CST  Install "caddy" snap
57   Done    today at 21:09 CST  today at 21:09 CST  Refresh "caddy" snap from "edge" channel
58   Done    today at 21:10 CST  today at 21:10 CST  Revert "caddy" snap
59   Done    today at 21:13 CST  today at 21:13 CST  Remove "caddy" snap
```

當天做過的安裝、更新、回滾、移除、權限切換都有記錄；ID 42–48 是第 3 章 Nextcloud 的操作。用 `snap tasks` 可以看某一筆底下的細部步驟，例如 ID 58 的 Caddy 回滾：

```bash
snap tasks 58
```

```text
Status  Spawn               Ready               Summary
Done    today at 21:10 CST  today at 21:10 CST  Ensure prerequisites for "caddy" are available
Done    today at 21:10 CST  today at 21:10 CST  Prepare snap "" (708)
Done    today at 21:10 CST  today at 21:10 CST  Stop snap "caddy" services
Done    today at 21:10 CST  today at 21:10 CST  Make current revision for snap "caddy" unavailable
Done    today at 21:10 CST  today at 21:10 CST  Prepare snap "caddy" (708) for security profile setup
Done    today at 21:10 CST  today at 21:10 CST  Make snap "caddy" (708) available to the system
Done    today at 21:10 CST  today at 21:10 CST  Automatically connect eligible plugs and slots of snap "caddy"
Done    today at 21:10 CST  today at 21:10 CST  Start snap "caddy" (708) services
Done    today at 21:10 CST  today at 21:10 CST  Run health check of "caddy" snap
Done    today at 21:10 CST  today at 21:10 CST  Setup snap "caddy" (708) security profiles
```

一次 `snap revert` 背後拆成好幾個步驟：停止服務、讓目前的 revision 下線、掛上 708、重新連接介面、啟動服務、健康檢查（health check）、設定安全規則。

> **待確認**：素材提到「其中任何一步失敗，snapd 會把整個操作復原，不會停在一半」，還沒查到官方文件確認。

### 實作：停掉 snapd，執行中的服務會不會跟著停？

學 Snap 時一個常見的疑問是：Snap 是不是都跑在 snapd 裡面？snapd 停了，服務會不會跟著停？實際測試的結果是不會。

我的理解是 snapd 負責管理：下載套件、掛載 SquashFS、產生 AppArmor 規則、向 systemd 註冊服務。服務啟動之後，由 systemd 管理（例如 LXD 的 `snap.lxd.daemon.service`），AppArmor 與 seccomp 的規則也已經載入核心，不再經過 snapd。

> **待確認**：上面這段架構說明是素材的整理，和下面的實測結果一致，但還沒和官方文件逐條核對。

#### 步驟 1：記下 LXD 和容器的 PID

這台主機上有 LXD 和 3 個執行中的容器：

```bash
ps aux | grep -i lxd
```

```text
root        6948  ... /bin/sh /snap/lxd/41228/commands/daemon.start
root        7392  ... lxcfs /var/snap/lxd/common/var/lib/lxcfs -p /var/snap/lxd/common/lxcfs.pid
root        7697  ... lxd --logfile /var/snap/lxd/common/lxd/logs/lxd.log --group lxd
lxd         8009  ... dnsmasq ... --interface=lxdbr0 ...
root        8084  ... [lxc monitor] /var/snap/lxd/common/lxd/containers node-20
root        8147  ... [lxc monitor] /var/snap/lxd/common/lxd/containers node-24
root       17804  ... [lxc monitor] /var/snap/lxd/common/lxd/containers mgmt-node
```

LXD 是 `7697`，3 個容器是 `8084`、`8147`、`17804`。

#### 步驟 2：停掉 snapd 和它的 socket

```bash
sudo systemctl stop snapd.service snapd.socket
```

#### 步驟 3：試試 snap 指令

```bash
snap list
```

指令卡住沒有回應，直到我按 `Ctrl + C` 才結束。snapd 停了，`snap` 指令就沒辦法管理套件。

> **待確認**：素材提到 `snap` 指令連不到 `/run/snapd.socket` 時會等待重試，到逾時才結束；這次是手動中斷，沒有等到逾時，也還沒查到官方說明。

#### 步驟 4：再看一次 LXD 和容器

```bash
ps aux | grep -i lxd
```

輸出和步驟 1 完全一樣，`7697`、`8009`、`8084`、`8147`、`17804` 這些 PID 都沒變，代表 LXD 和容器在 snapd 停掉的期間沒有重新啟動。

#### 步驟 5：把 snapd 啟動回來

```bash
sudo systemctl start snapd.socket snapd.service
snap list
```

`snap list` 馬上列出所有套件，管理功能恢復。

#### snapd 停掉時，哪些事會受影響

| 項目 | 狀態 | 說明 |
| --- | --- | --- |
| 執行中的服務與容器 | 照常運作 | 這次實測 LXD 與 3 個容器的 PID 沒變 |
| 正在用的桌面程式 | 照常運作 | 素材的觀察，這次沒有另外記錄 |
| `snap` 管理指令 | 無法使用 | `install`、`refresh`、`remove` 都要等 snapd 回來 |
| 自動更新 | 暫停 | snapd 不在，就不會檢查或下載更新 |
| 新開某些桌面程式 | 可能受影響 | 素材提到需要向 snapd 要求權限的桌面程式，啟動時可能受阻；這次沒有實測 |

> **本站補充**：Docker 的預設行為不一樣。Docker 官方文件寫到，預設情況下 Docker daemon 結束時會把執行中的容器停掉；要讓容器在 daemon 不在時繼續跑，需要另外開啟 live restore（在 `/etc/docker/daemon.json` 加上 `"live-restore": true`）。來源：[Docker docs：Live restore](https://github.com/docker/docs/blob/main/content/manuals/engine/daemon/live-restore.md)。

### 延伸：IoT 裝置與 Ubuntu Core

Snap 也被用在 IoT（物聯網）裝置上。素材提到兩個和 IoT 有關的設計：

- **transactional update（交易式更新）**：新版本準備好之前，舊版本繼續運作；更新中途斷電或斷網，裝置仍停在原本可以用的版本。素材舉的例子是散在各地的充電樁或監控設備，更新失敗時不必派人到現場重灌。
- **delta update（差異更新）**：只下載新舊版本之間有變動的部分，節省按流量計費的行動網路用量。

> **待確認**：這兩項的細節（更新中斷時的處理方式、delta 更新能省多少流量）還沒查到官方文件，素材中的節省比例先不列出。

Ubuntu Core 是 Canonical 為 IoT 與嵌入式裝置做的 Ubuntu 版本，官方文件稱它是「immutable and transaction-based version of Ubuntu」（不可變、以交易為基礎）。依官方文件《Inside Ubuntu Core》，系統由這幾種 Snap 組成：

| Snap 類型 | 負責 |
| --- | --- |
| gadget | 開機相關檔案（boot assets）與硬體設定 |
| kernel | Linux kernel 與模組 |
| base | 應用程式的執行環境，也是 Ubuntu Core 的根檔案系統 |
| snapd | 管理所有 Snap |
| 應用程式 Snap | 實際的業務程式 |

官方文件也寫到，存放開機檔案的 `ubuntu-seed`、`ubuntu-boot` 分割區是唯讀的，可寫入的資料放在 `ubuntu-data` 分割區。

### 實作：用 Multipass 開一台 Ubuntu Core 虛擬機

```bash
sudo snap install multipass
multipass find --force-update
```

Ubuntu Core 的映像檔在 `core` 這個遠端來源底下，名稱要加上 `core:` 前綴，例如 `core:core22`。只打 `core22` 會找不到映像檔。

```bash
multipass launch core:core22 --name my-core
multipass shell my-core
```

登入時的歡迎訊息寫著：

```text
This Ubuntu Core 22 machine is a tiny, transactional edition of Ubuntu, designed for appliances, firmware and fixed-function VMs. ... It's a brave new world here in Ubuntu Core!
```

以下指令在 `my-core` 虛擬機裡執行。先試試 APT：

```bash
apt
```

```text
-bash: apt: command not found
```

Ubuntu Core 沒有 APT。再看裝了哪些 Snap：

```bash
snap list
```

```text
Name       Version         Rev    Tracking       Publisher    Notes
core22     20230703        817    latest/stable  canonical✓  base
pc         22-0.3          146    22/stable      canonical✓  gadget
pc-kernel  5.15.0-76.83.1  1321   22/stable      canonical✓  kernel
snapd      2.59.5          19457  latest/stable  canonical✓  snapd
```

整個系統只有 4 個 Snap，剛好對應上面的表格：`pc` 是 gadget、`pc-kernel` 是 kernel、`core22` 是 base，再加上 `snapd`。

試著在系統目錄建立檔案：

```bash
sudo touch /usr/bin/test_hacker
```

```text
touch: cannot touch '/usr/bin/test_hacker': Read-only file system
```

即使用 `sudo`，`/usr/bin` 也寫不進去。在 Ubuntu Core 上，不能像一般 Ubuntu 那樣直接改系統目錄裡的檔案。

測試完離開虛擬機，再刪掉它：

```bash
exit
multipass delete my-core --purge
```

### 這一章的小結

- 切換通道與回滾都是以 revision 為單位切換：這次 Caddy 從 708 切到 722 再回到 708，執行檔、hash 都跟著變，測試檔一直讀得到。
- `snap changes`、`snap tasks` 記錄了每次操作與背後的步驟。
- 停掉 snapd 時，LXD 和 3 個容器的 PID 都沒變；受影響的是 `snap` 管理指令與自動更新。
- Ubuntu Core 整個系統由 Snap 組成，沒有 APT，`/usr/bin` 是唯讀的。
- 下一章用 Nextcloud 架一台私有雲端硬碟，練習設定、防火牆、跨大版本更新，以及移除後的快照清理。
