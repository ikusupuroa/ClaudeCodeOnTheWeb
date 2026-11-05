---
title: 第 1 章：Snap 是什麼？看懂掛載方式與權限介面
pubDate: 2026-11-05
summary: 從自己電腦上已經裝好的 Snap 開始：用 snap list、snap version、snap info 看套件與通道，用 lsblk 看 Snap 怎麼以唯讀方式掛載，再實際拔掉、插回 Firefox 的相機權限，認識 confinement（隔離等級）與 plug／slot 介面。
product: Snap
tags:
  - Snap
  - Ubuntu
  - Security
environment:
  - Ubuntu 26.04 LTS（kernel 7.0.0-42-generic、amd64）
  - snapd 2.77.1
references:
  - title: Snapcraft - The app store for Linux
    url: https://snapcraft.io/
  - title: Snapcraft Documentation
    url: https://snapcraft.io/docs/
  - title: About Snapcraft
    url: https://snapcraft.io/about
---

> **僅供學習參考。** 這是我在自己的 Ubuntu 主機上的學習紀錄，不是 Canonical 官方文件。

## 產品介紹

### Snap 是什麼

在 Ubuntu 上裝軟體，最常用的是 APT（例如 `sudo apt install vlc`）。APT 安裝的軟體會共用系統裡的函式庫（例如 `glibc`、`openssl`），版本不合時，裝新軟體可能動到其他軟體需要的函式庫，這就是常聽到的 dependency hell（相依地獄）。

Snap 的做法是把軟體和它需要的函式庫打包在一起（self-contained，自帶相依）。我自己用「微波便當盒」來記：主菜、配菜、餐具都裝在同一個盒子裡，拿到哪台微波爐都能加熱；盒子是密封的，裡面的東西不會灑到廚房。對應到 Snap，就是同一個套件可以裝在不同的 Linux 發行版上，而且預設跑在沙盒（sandbox，隔離環境）裡。

### 四個主要元件

| 元件 | 角色 |
| --- | --- |
| Snap（套件本體） | 副檔名 `.snap` 的壓縮檔，也就是那個便當盒 |
| snapd | 常駐在背景的服務（daemon，守護行程），負責下載、掛載、排程更新與管理權限 |
| Snapcraft | 開發者用的打包工具，寫一份 `snapcraft.yaml` 就能把程式打包成 Snap（第 4 章實作） |
| Snap Store | 官方的線上商店，負責搜尋、下載與發布 |

流程是：開發者用 Snapcraft 打包 → 上架到 Snap Store → 使用者電腦上的 snapd 下載並排程更新 → 套件在隔離環境中執行。

### 和其他軟體交付方式的比較

> **本站補充**：這張表整理自我的筆記與各專案的公開說明，是我學習時的理解，不是官方的比較。

| 比較項目 | Snap | Flatpak | Docker／Podman | APT（`.deb`） |
| --- | --- | --- | --- | --- |
| 主要用途 | 桌面程式、伺服器服務、IoT 裝置 | 桌面圖形程式 | 伺服器容器與後端服務 | 作業系統元件與一般軟體 |
| 背景服務 | 支援，交給 systemd 管理 | 以桌面程式為主 | 支援，由容器引擎管理 | 支援 |
| 隔離方式 | AppArmor、seccomp、namespaces | Bubblewrap、Portals | cgroups、namespaces | 沒有沙盒 |
| 更新方式 | 以 revision（修訂版）為單位整包切換，可以回滾 | 透過 OSTree 更新 | 拉新的 image 換掉容器 | 逐一覆蓋檔案 |

## 技術文件導讀與實作

### 看看電腦上已經有哪些 Snap

```bash
snap list
```

```text
Name                       Version                         Rev    Tracking         Publisher            Notes
bare                       1.0                             5      latest/stable    canonical✓           base
canonical-livepatch        v11.1.0                         418    latest/stable    canonical✓           -
core18                     20260901                        3084   latest/stable    canonical✓           base
core22                     20260909                        2987   latest/stable    canonical✓           base
core24                     20260824                        2124   latest/stable    canonical✓           base
core26                     20260925                        646    latest/stable    canonical✓           base
firefox                    154.0-1                         8763   latest/stable/…  mozilla✓             -
lxd                        6.10.1-f5c750d                  41228  6/stable         canonical✓           -
obsidian                   1.15.0                          72     latest/stable    obsidianmd           classic
snapd                      2.77.1                          28254  latest/stable    canonical✓           snapd
```

從這份清單看到兩件事：

- **好幾個 base 並存**：`core18`、`core22`、`core24`、`core26` 都在。base 是 Snap 執行時的基礎系統環境，每個套件可以指定自己要用哪一個，彼此不衝突。用 APT 同時裝不同世代的底層函式庫，就很容易出現相依衝突。
- **`Notes` 欄位看得出隔離等級**：`obsidian` 標 `classic`，可以像一般軟體一樣讀寫硬碟上的任何位置，筆記軟體需要讀寫使用者放在各處的 Markdown 檔；`firefox` 是 `-`，代表預設的 strict（嚴格隔離）。`base` 標的是基礎系統環境。

### 檢查 snap 與 snapd 的版本

```bash
snap version
```

```text
snap          2.77.1+ubuntu26.04.2
snapd         2.77.1+ubuntu26.04.2
series        16
ubuntu        26.04
kernel        7.0.0-42-generic
architecture  amd64
```

### 查詢商店上的套件資訊

```bash
snap info vlc
```

```text
name:      vlc
summary:   The ultimate media player
publisher: VideoLAN✓
...
channels:
  latest/stable:    3.0.24-rc1                  2026-09-22 (4472) 278MB -
  latest/candidate: 3.0.24-rc1                  2026-09-17 (4472) 278MB -
  latest/beta:      3.0.24-53-gc128d1f15c       2026-11-05 (4566) 277MB -
  latest/edge:      4.0.0-dev-39617-gc6d1df39c7 2026-11-05 (4567) 351MB -

_1) Camera and microphone access are required for recording features._
```

- `channels` 列出各個通道（channel）目前的版本。`latest/edge` 已經是 `4.0.0-dev`，想試新版功能時可以用 `--channel=edge` 安裝，不用自己編譯原始碼。通道的結構在第 2 章實作。
- 最後一行說錄影功能需要相機和麥克風權限。Snap 預設拿不到這些裝置，要透過下面的 plug／slot 介面授權。

### Snap 怎麼安裝：唯讀掛載，不解壓縮

`.deb` 安裝時會把檔案解開，放進 `/usr/bin`、`/usr/lib` 等系統目錄。Snap 的做法不同：

1. `.snap` 檔本身是一個 SquashFS 唯讀壓縮映像檔。
2. 安裝時不解壓縮，而是透過 loop device（虛擬區塊裝置）掛載到 `/snap/<套件名>/<revision>/`。
3. 執行時直接從映像檔讀取；套件要寫入的資料放在自己的資料目錄 `/var/snap/<套件名>/`，不會寫進系統目錄。

新版 Ubuntu 的 `df -h` 預設不顯示這些 loop 裝置，所以要改用 `lsblk`，或是 `df` 加上 `-a`：

```bash
lsblk | grep snap
df -ah | grep /snap
```

`lsblk` 的輸出（節錄）：

```text
loop0    7:0    0  74.3M  1 loop /snap/core22/2987
loop1    7:1    0 266.6M  1 loop /snap/firefox/8763
loop2    7:2    0 110.2M  1 loop /snap/obsidian/72
...
```

每個 Snap 是一個獨立的 loop 裝置，`RO` 欄位是 `1`，表示唯讀。

接著看 `/snap` 底下的目錄：

```bash
ls -l /snap
ls -l /snap/firefox
```

`ls -l /snap/firefox` 的輸出：

```text
drwxr-xr-x 8 root root 4096 Oct 13 19:12 8763
lrwxrwxrwx 1 root root    4 Oct 13 19:12 current -> 8763
```

- `8763` 就是 `snap list` 看到的 revision，也是唯讀的掛載點。
- `current -> 8763` 是符號連結（symlink）。更新時會掛載新的 revision 目錄，再把 `current` 指過去；回滾就是把 `current` 指回舊的 revision。第 2 章會用 Caddy 實際操作一次。

### 三種隔離等級（confinement）

| 隔離等級 | 我的比喻 | 特性 | 例子 |
| --- | --- | --- | --- |
| strict（嚴格隔離） | 關在玻璃罩裡 | 預設模式，存取家目錄、麥克風等資源都要透過介面授權 | 一般工具、網路服務、Nextcloud |
| classic（傳統模式） | 走出玻璃罩 | 和傳統軟體一樣可以存取整個系統，安裝時要加 `--classic` | VS Code、編譯器、Go |
| devmode（開發者模式） | 帶著警報器的測試員 | 違反隔離規則的動作只記錄警告、不阻擋，用在開發測試階段 | 打包測試中的軟體 |

### plug 與 slot：用介面開權限

strict 的軟體需要用到麥克風、外接硬碟這類資源時，Snap 用 interface（介面）來授權：

- **plug（插頭）**：軟體宣告「我需要這個功能」，例如 VLC 的 `audio-record`。
- **slot（插槽）**：提供這個功能的一方，例如系統提供的 `:audio-record`。
- `snap connect` 把插頭插上，權限就開通；`snap disconnect` 拔掉，權限就收回。

查看某個套件的介面連線：

```bash
snap connections firefox
```

從輸出可以看到兩種 slot：

- **開頭是冒號**（例如 `:camera`、`:network`）：由系統提供的能力。
- **開頭有套件名**（例如 `mesa-2404:gpu-2404`、`gtk-common-themes:gtk-3-themes`）：由其他 Snap 提供的內容，稱為 content interface（內容共享介面）。顯示卡驅動、桌面主題由專門的 Snap 提供，其他套件共用，不必每個套件各自帶一份。

`Notes` 欄位如果是 `manual`，表示這個連線是使用者手動設定的。像 `nmap:network-control` 這類權限較大的介面，預設不會自動連線，要使用者自己 `snap connect`。

### 實作：拔掉再插回 Firefox 的相機權限

先看目前的相機連線（預設已連線）：

```bash
snap connections firefox | grep camera
```

```text
camera  firefox:camera  :camera  -
```

拔掉相機權限：

```bash
sudo snap disconnect firefox:camera
snap connections firefox | grep camera
```

slot 變成 `-`，表示已經沒有連線：

```text
camera  firefox:camera  -        -
```

插回去：

```bash
sudo snap connect firefox:camera
snap connections firefox | grep camera
```

```text
camera  firefox:camera  :camera  manual
```

最後的 `Notes` 從 `-` 變成 `manual`，snapd 記下了這是使用者手動設定的連線。

### 這一章的小結

- Snap 以唯讀的 SquashFS 映像檔掛載在 `/snap/<套件名>/<revision>/`，`current` 符號連結指向目前使用的 revision。
- `snap list` 的 `Notes` 看得出隔離等級；strict 的套件要透過 plug／slot 介面拿權限，`snap connect`、`snap disconnect` 可以自己開關。
- 下一章用 Caddy 練習切換通道與回滾，並測試 snapd 停掉時正在跑的服務會不會受影響。
