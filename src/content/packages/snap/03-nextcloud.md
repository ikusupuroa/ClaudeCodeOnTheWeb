---
title: 第 3 章：用 Nextcloud Snap 架私有雲端硬碟
pubDate: 2026-11-05
summary: 安裝 Nextcloud 27 版，把 HTTP 埠號改成 10081、用 UFW 放行，建立管理者帳號並設定 trusted_domains；接著跨大版本更新到 28 再回滾。最後示範一般移除會留下資料快照，以及怎麼用 snap saved 與 snap forget 清掉。
product: Snap
tags:
  - Snap
  - Nextcloud
  - UFW
environment:
  - Ubuntu 26.04 LTS（snapd 2.77.1）
  - Nextcloud Snap（27/stable、28/stable）
  - UFW 防火牆
references:
  - title: Nextcloud Snap 套件頁
    url: https://snapcraft.io/nextcloud
  - title: nextcloud-snap（Nextcloud Snap 的原始碼與說明）
    url: https://github.com/nextcloud-snap/nextcloud-snap
  - title: Chromium 原始碼：受限制的連接埠清單（port_util.cc）
    url: https://github.com/chromium/chromium/blob/main/net/base/port_util.cc
---

> **僅供學習參考。** 這是我在自己的 Ubuntu 主機上的學習紀錄，不是 Canonical 或 Nextcloud 的官方文件。文中的 IP 與密碼已換成範例值，請換成你自己的。

## 前情提要

- **上一章完成了**：用 Caddy 練習切換通道與回滾，確認資料跟著 revision 切換；停掉 snapd 時，LXD 和容器照常運作；也開了一台 Ubuntu Core 虛擬機。
- **這一章要處理**：換成比較大的伺服器服務 Nextcloud（私有雲端硬碟），走一遍安裝、改埠號、防火牆、初始設定、跨大版本更新與回滾，最後處理移除後留下的資料快照。

## 技術文件導讀與實作

### 步驟 1：查詢可用的通道

```bash
snap info nextcloud
```

輸出的 `channels` 會列出目前維護中的大版本，例如 `latest/stable`、`28/stable`、`27/stable`。

### 步驟 2：安裝 27 版

用 `--channel` 指定 27 這個 track，之後才能練習升級到 28：

```bash
sudo snap install nextcloud --channel=27/stable
snap list nextcloud
```

### 步驟 3：把埠號改成 10081，並在 UFW 放行

我一開始用的是 10080，結果 `curl -I` 正常回應 `HTTP/1.1 302 Found`，瀏覽器卻顯示「此網址受到限制」（This address is restricted），連不上。原因是瀏覽器會封鎖一些特定的連接埠，10080 就在清單裡。Chromium 的原始碼裡，受限制的連接埠清單 `kRestrictedPorts` 列了 `10080, // Amanda`（Amanda 是一套備份軟體使用的埠號）。所以這次改用 10081。

> **待確認**：Firefox 是否也封鎖 10080，以及封鎖原因是否和素材提到的 NAT Slipstreaming 2.0 攻擊有關，還沒查到官方來源。

設定 Nextcloud 的 HTTP 埠號並確認：

```bash
sudo snap set nextcloud ports.http=10081
sudo snap get nextcloud ports.http
```

在 UFW 防火牆放行 10081，再看規則：

```bash
sudo ufw allow 10081/tcp comment 'Nextcloud Snap HTTP Port'
sudo ufw status verbose
```

用 `ufw allow`、`ufw delete` 增刪規則後會直接生效，不用另外執行 `sudo ufw reload`。需要 reload 的情況，是手動改了 `/etc/ufw/before.rules` 這類設定檔（例如設定 NAT 轉發）。

### 步驟 4：建立管理者帳號

一行指令完成資料庫初始化並建立管理者 `admin`。把 `<已遮蔽>` 換成你自己設定的密碼：

```bash
sudo nextcloud.manual-install admin <已遮蔽>
```

### 步驟 5：設定 trusted_domains 與網址

`trusted_domains` 比對的是瀏覽器網址列裡的主機名稱（HTTP 的 `Host` 標頭），也就是伺服器自己的位址，不是訪客電腦的 IP。用非標準埠號（不是 80、443）時，`Host` 會帶著埠號（例如 `192.0.2.10:10081`），所以這次我把帶埠號和不帶埠號的位址都加進去。

> **待確認**：「非標準埠號時 `trusted_domains` 必須包含埠號」這點，還沒在 Nextcloud 官方的管理手冊中確認。

先查這台主機的 IP：

```bash
hostname -I | awk '{print $1}'
```

把下面的 `192.0.2.10` 換成你查到的 IP：

```bash
sudo nextcloud.occ config:system:set trusted_domains 1 --value="192.0.2.10:10081"
sudo nextcloud.occ config:system:set trusted_domains 2 --value="192.0.2.10"
```

再設定 `overwritehost` 與 `overwrite.cli.url`，讓 Nextcloud 產生的轉址與網址都帶上 10081。nextcloud-snap 的說明文件提到，自動偵測主機名稱失敗、轉址不正確時，可以用 `overwritehost` 指定主機名稱，必要時連埠號一起寫：

```bash
sudo nextcloud.occ config:system:set overwritehost --value="192.0.2.10:10081"
sudo nextcloud.occ config:system:set overwrite.cli.url --value="http://192.0.2.10:10081"
sudo nextcloud.occ config:system:get trusted_domains
```

在瀏覽器輸入下面的網址，用 `admin` 和步驟 4 設定的密碼登入：

```text
http://192.0.2.10:10081
```

如果用 `curl http://192.0.2.10:10081` 測試，畫面會直接換行、沒有輸出。這是因為首頁回應的是 `HTTP 302 Found`，轉址到 `/index.php/login`，內容是空的。改用 `curl -I` 看回應標頭，或用 `curl -L` 跟著轉址，就看得到結果。

### 步驟 6：跨大版本更新與回滾

切換到 28 這個 track：

```bash
sudo snap refresh nextcloud --channel=28/stable
```

更新後，埠號 10081、資料和管理者帳號都還在。

> **待確認**：素材提到「更新時會自動完成資料庫遷移」，這次沒有記錄更新過程的輸出，也還沒查到 nextcloud-snap 的官方說明。

如果新版本有問題（例如外掛不相容），可以回滾：

```bash
sudo snap revert nextcloud
```

回到 27 版後，設定、埠號 10081 與資料都還在。

### 步驟 7：移除與清理

先刪掉 UFW 的 10081 規則：

```bash
sudo ufw delete allow 10081/tcp
sudo ufw status verbose
```

移除 Nextcloud 有兩種做法：

```bash
# 做法 A：連資料快照一起刪掉
sudo snap remove nextcloud --purge
```

```bash
# 做法 B：一般移除，會留下資料快照
sudo snap remove nextcloud
```

這次我用的是做法 B，終端機顯示：

```text
nextcloud removed (snap data snapshot saved)
```

一般移除時，snapd 會把這個套件的資料與設定打包成一份快照（snapshot）留著，誤刪時還有機會救回來；也因為這樣，移除後硬碟空間沒有馬上釋放。

> **待確認**：自動快照預設會保留多久，還沒查到官方文件。

查看目前保留的快照：

```bash
snap saved
```

```text
Set  Snap       Age    Version       Rev    Size    Notes
5    nextcloud  60.0s  27.1.11snap1  44288  46.4MB  auto
```

刪掉這份快照（把 `5` 換成你看到的 `Set` 編號），再確認一次：

```bash
sudo snap forget 5
snap saved
```

終端機回應 `Snapshot #5 forgotten.`，快照刪掉了，空間也跟著釋放。

已經用做法 B 移除之後，再下 `sudo snap remove nextcloud --purge` 會出現 `snap is not installed` 的錯誤，因為套件已經不在了。這時留下的快照只能用 `snap saved` 查出編號，再用 `snap forget` 刪掉。

### 這一章的小結

| 想做的事 | 指令 |
| --- | --- |
| 改 Nextcloud 的設定 | `sudo snap set nextcloud ports.http=10081`、`sudo snap get nextcloud ports.http` |
| 指定大版本安裝、更新 | `--channel=27/stable`、`sudo snap refresh nextcloud --channel=28/stable` |
| 回到上一個 revision | `sudo snap revert nextcloud` |
| 移除時不留快照 | `sudo snap remove nextcloud --purge` |
| 清掉移除後留下的快照 | `snap saved`、`sudo snap forget <Set 編號>` |

- 下一章換個角色，從使用者變成打包者：用 Snapcraft 把自己寫的網頁小遊戲打包成 Snap。
