---
title: 第 4 章：用 Snapcraft 打包自己的網頁小遊戲
pubDate: 2026-11-05
summary: 寫一個純 HTML5 的貪食蛇遊戲，用 snapcraft.yaml 搭配 dump plugin 與 stage-packages，把遊戲和 Python 3 的 HTTP 伺服器一起打包成 Snap；用 --dangerous 在本機安裝，再加上 daemon 改成開機自動啟動的背景服務。
product: Snap
tags:
  - Snap
  - Snapcraft
  - systemd
environment:
  - Ubuntu 26.04 LTS（snapd 2.77.1）
  - Snapcraft 9.2.1（classic 安裝）
  - base：core22
references:
  - title: Creating a snap
    url: https://snapcraft.io/docs/creating-a-snap
  - title: The snapcraft.yaml schema
    url: https://snapcraft.io/docs/snapcraft-yaml-reference
  - title: Snapcraft plugins
    url: https://snapcraft.io/docs/snapcraft-plugins
  - title: Services and daemons
    url: https://snapcraft.io/docs/services-and-daemons
---

> **僅供學習參考。** 這是我在自己的 Ubuntu 主機上的學習紀錄，不是 Canonical 官方文件。

## 前情提要

- **前幾章完成了**：以使用者的角度操作別人發布的 Snap：看掛載方式與權限介面、切換通道與回滾、測試 snapd 停掉時的影響，以及用 Nextcloud 走完安裝到移除的流程。
- **這一章要處理**：換成打包者的角度，用 Snapcraft 把自己寫的網頁小遊戲打包成 Snap，在本機安裝測試，再改成開機自動啟動的背景服務。

## 技術文件導讀與實作

### 打包前先分清楚兩個目錄

- **開發工作目錄**：打包時，原始碼和設定檔放在自己的專案目錄，這一章用 `~/my-snap-game`。
- **安裝後的目錄**：打包完、執行 `snap install` 後，產生的 `.snap` 才會唯讀掛載到 `/snap/my-snake-game`，資料目錄在 `/var/snap/my-snake-game`，和前幾章看到的一樣。

### snapcraft.yaml 的四個部分

如果把打包比喻成組裝樂高，`snapcraft.yaml` 就是組裝說明書，主要分成四個部分：

| 部分 | 內容 |
| --- | --- |
| Metadata（基本資料） | 名稱 `name`、版本 `version`、一句話簡介 `summary`、完整說明 `description` |
| Base（基礎系統） | 要用哪個 base，例如 `base: core22` 是以 Ubuntu 22.04 LTS 的最小系統為基礎 |
| Parts（零件） | 原始碼在哪裡、用哪個 plugin（外掛）處理、需要哪些額外套件（`stage-packages`） |
| Apps（程式） | 安裝後用什麼指令執行、要不要當背景服務（`daemon`）、需要哪些介面（`plugs`） |

### 步驟 1：安裝 Snapcraft，建立專案目錄

Snapcraft 要用 `--classic` 安裝，因為它需要存取主機上的檔案來編譯與打包：

```bash
sudo snap install snapcraft --classic
snapcraft --version
mkdir -p ~/my-snap-game
cd ~/my-snap-game
```

### 步驟 2：寫一個純 HTML5 的貪食蛇遊戲

第一次打包，我選了沒有建置步驟的範例：一個只用 HTML、CSS、JavaScript 寫的貪食蛇遊戲，不需要 `npm install`，也不需要編譯。遊戲用 Canvas 畫面、有計分板，用鍵盤方向鍵操作；執行時用 Python 3 內建的 HTTP 伺服器提供網頁。

在專案目錄下建立 `src/index.html`：

```bash
mkdir -p ~/my-snap-game/src
cat << 'EOF' > ~/my-snap-game/src/index.html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <title>Retro Snake Snap Game</title>
    <style>
        body {
            background-color: #2c001e;
            color: #ffffff;
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
        }
        h1 { margin-bottom: 5px; color: #E95420; }
        p { margin-top: 0; color: #aea79f; }
        #game-board {
            border: 4px solid #E95420;
            background-color: #111;
            box-shadow: 0 8px 24px rgba(0,0,0,0.6);
        }
        #score-board {
            font-size: 20px;
            margin: 10px 0;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <h1> Canonical Snap 復古貪食蛇 </h1>
    <p>這是一個完全封裝在 Snap 沙盒內的 Web 遊戲！請用鍵盤 [上下左右] 操作</p>
    <div id="score-board">分數: <span id="score">0</span></div>
    <canvas id="game-board" width="400" height="400"></canvas>

    <script>
        const canvas = document.getElementById("game-board");
        const ctx = canvas.getContext("2d");
        const grid = 20;
        let count = 0;
        let score = 0;

        let snake = {
            x: 160, y: 160,
            dx: grid, dy: 0,
            cells: [],
            maxCells: 4
        };
        let apple = { x: 320, y: 320 };

        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        }

        function loop() {
            requestAnimationFrame(loop);
            if (++count < 6) return; // 控制遊戲速度
            count = 0;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            snake.x += snake.dx;
            snake.y += snake.dy;

            // 撞牆穿透
            if (snake.x < 0) snake.x = canvas.width - grid;
            else if (snake.x >= canvas.width) snake.x = 0;
            if (snake.y < 0) snake.y = canvas.height - grid;
            else if (snake.y >= canvas.height) snake.y = 0;

            snake.cells.unshift({x: snake.x, y: snake.y});
            if (snake.cells.length > snake.maxCells) snake.cells.pop();

            // 畫蘋果
            ctx.fillStyle = '#E95420';
            ctx.fillRect(apple.x, apple.y, grid-1, grid-1);

            // 畫蛇身
            ctx.fillStyle = '#77216F';
            snake.cells.forEach(function(cell, index) {
                if (index === 0) ctx.fillStyle = '#00ffcc'; // 蛇頭
                else ctx.fillStyle = '#77216F';
                ctx.fillRect(cell.x, cell.y, grid-1, grid-1);

                // 吃蘋果
                if (cell.x === apple.x && cell.y === apple.y) {
                    snake.maxCells++;
                    score += 10;
                    document.getElementById('score').innerText = score;
                    apple.x = getRandomInt(0, 20) * grid;
                    apple.y = getRandomInt(0, 20) * grid;
                }

                // 撞自己死亡重開
                for (let i = index + 1; i < snake.cells.length; i++) {
                    if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
                        snake.x = 160; snake.y = 160;
                        snake.cells = [];
                        snake.maxCells = 4;
                        snake.dx = grid; snake.dy = 0;
                        score = 0;
                        document.getElementById('score').innerText = score;
                    }
                }
            });
        }

        document.addEventListener('keydown', function(e) {
            if (e.which === 37 && snake.dx === 0) { snake.dx = -grid; snake.dy = 0; }
            else if (e.which === 38 && snake.dy === 0) { snake.dy = -grid; snake.dx = 0; }
            else if (e.which === 39 && snake.dx === 0) { snake.dx = grid; snake.dy = 0; }
            else if (e.which === 40 && snake.dy === 0) { snake.dy = grid; snake.dx = 0; }
        });

        requestAnimationFrame(loop);
    </script>
</body>
</html>
EOF
```

### 步驟 3：寫啟動腳本與 snapcraft.yaml

這個 Snap 會用到的設定：

- **`dump` plugin**：把本機 `src/` 裡的檔案原封不動複製進 Snap。
- **`stage-packages: [python3-minimal]`**：打包時從 Ubuntu 套件庫抓最小版的 Python 3 一起放進 Snap，使用者的電腦沒裝 Python 也能執行。
- **`network-bind` plug**：strict 隔離下，程式要監聽連接埠（這裡是 8099），需要宣告這個介面。
- **`$SNAP` 環境變數**：Snap 執行時，`$SNAP` 是套件掛載的唯讀目錄路徑。

#### 啟動腳本 launcher.sh

```bash
cat << 'EOF' > ~/my-snap-game/launcher.sh
#!/bin/bash
# 輸出友善提示
echo "=========================================================="
echo "  Canonical Snap 復古貪食蛇網頁遊戲已在背景啟動！"
echo "  請開啟瀏覽器連線： http://localhost:8099"
echo "  (按 Ctrl+C 可隨時關閉遊戲伺服器)"
echo "=========================================================="

# 使用 Snap 內部自帶的 Python 3 啟動 HTTP 伺服器
exec python3 -m http.server 8099 --directory "$SNAP/htdocs"
EOF

chmod +x ~/my-snap-game/launcher.sh
```

#### snap/snapcraft.yaml

`snapcraft.yaml` 要放在專案的 `snap/` 資料夾裡：

```bash
mkdir -p ~/my-snap-game/snap
cat << 'EOF' > ~/my-snap-game/snap/snapcraft.yaml
name: my-snake-game
base: core22
version: '1.0.0'
summary: Retro Snake HTML5 Web Game in a Snap
description: |
  這是一個使用 Canonical Snapcraft 打包的經典像素貪食蛇網頁遊戲！
  自帶 Python 3 輕量伺服器與 Strict 嚴格沙盒隔離，跨所有 Linux 發行版即開即玩。

grade: stable
confinement: strict

apps:
  my-snake-game:
    command: launcher.sh
    plugs:
      - network
      - network-bind

parts:
  web-content:
    plugin: dump
    source: src/
    organize:
      '*': htdocs/

  launcher:
    plugin: dump
    source: .
    stage:
      - launcher.sh
    stage-packages:
      - python3-minimal
EOF
```

`web-content` 用 `organize` 把 `src/` 的檔案放到 Snap 裡的 `htdocs/`，正好對應 `launcher.sh` 裡的 `$SNAP/htdocs`。

### 步驟 4：打包成 .snap

Snapcraft 預設會開一個 LXD 容器在裡面建置，不會動到主機。加上 `--destructive-mode` 則直接在主機上建置，省掉啟動容器的時間，適合這種只有腳本和靜態檔案的小專案：

```bash
cd ~/my-snap-game
snapcraft pack --destructive-mode
```

建置紀錄（Snapcraft 9.2.1）：

```text
Generated snap metadata
Lint warnings:
- metadata: Metadata field 'title' is missing or empty. (https://documentation.ubuntu.com/snapcraft/stable/reference/project-file/snapcraft-yaml/#title)
- metadata: Metadata field 'contact' is missing or empty. (https://documentation.ubuntu.com/snapcraft/stable/reference/project-file/snapcraft-yaml/#contact)
- metadata: Metadata field 'license' is missing or empty. (https://documentation.ubuntu.com/snapcraft/stable/reference/project-file/snapcraft-yaml/#license)
Lint information:
- metadata: Metadata field 'issues' is missing or empty. (https://documentation.ubuntu.com/snapcraft/stable/reference/project-file/snapcraft-yaml/#issues)
- metadata: Metadata field 'source-code' is missing or empty. (https://documentation.ubuntu.com/snapcraft/stable/reference/project-file/snapcraft-yaml/#source-code
- metadata: Metadata field 'website' is missing or empty. (https://documentation.ubuntu.com/snapcraft/stable/reference/project-file/snapcraft-yaml/#website)
Created snap package my-snake-game_1.0.0_amd64.snap
```

`Lint warnings` 提醒 metadata 少了 `title`、`contact`、`license`，`Lint information` 列出還可以補的 `issues`、`source-code`、`website`，每一項都附上說明文件的連結。這些都不影響打包，最後一行顯示 `.snap` 已經產生。完成後用 `ls -lh *.snap` 可以看到 `my-snake-game_1.0.0_amd64.snap`。

### 步驟 5：在本機安裝並執行

從 Snap Store 下載的套件都有商店的數位簽章，自己打包的還沒有，所以本機安裝要加 `--dangerous`，表示你知道這個檔案沒有經過商店簽章：

```bash
sudo snap install ./my-snake-game_1.0.0_amd64.snap --dangerous
snap list my-snake-game
```

直接輸入套件名稱執行：

```bash
my-snake-game
```

```text
==========================================================
  Canonical Snap 復古貪食蛇網頁遊戲已在背景啟動！
  請開啟瀏覽器連線： http://localhost:8099
  (按 Ctrl+C 可隨時關閉遊戲伺服器)
==========================================================
Serving HTTP on 0.0.0.0 port 8099 (http://0.0.0.0:8099/) ...
```

用瀏覽器打開 `http://localhost:8099`，就可以用方向鍵玩貪食蛇。

### 步驟 6：改成開機自動啟動的背景服務

剛才的做法會佔住終端機，按 `Ctrl + C` 遊戲就停了。如果要像 Nextcloud 那樣在背景執行、開機自動啟動、當掉時自動重啟，可以在 app 加上 `daemon: simple` 和 `restart-condition: on-failure`，版本改成 1.1.0：

```bash
cat << 'EOF' > ~/my-snap-game/snap/snapcraft.yaml
name: my-snake-game
base: core22
version: '1.1.0'
summary: Retro Snake HTML5 Web Game in a Snap (Daemon Edition)
description: |
  自帶 Python 3 背景守護程序的貪食蛇遊戲，支援 systemd 開機自啟與服務控管。

grade: stable
confinement: strict

apps:
  my-snake-game:
    command: launcher.sh
    daemon: simple
    restart-condition: on-failure
    plugs:
      - network
      - network-bind

parts:
  web-content:
    plugin: dump
    source: src/
    organize:
      '*': htdocs/

  launcher:
    plugin: dump
    source: .
    stage:
      - launcher.sh
    stage-packages:
      - python3-minimal
EOF
```

重新打包，再用 `snap install` 安裝新的檔案：

```bash
snapcraft pack --destructive-mode
sudo snap install ./my-snake-game_1.1.0_amd64.snap --dangerous
snap list my-snake-game
sudo snap services my-snake-game
```

`snap refresh` 是向 Snap Store 拉更新用的；本機自己打包的檔案，更新方式就是再執行一次 `snap install <新檔案> --dangerous`。已經裝過同名套件時，這會變成更新而不是重裝，revision 往上加一。

```text
Name           Version  Rev  Tracking  Publisher  Notes
my-snake-game  1.1.0    x2   -         -          -
```

```text
Service                      Startup  Current  Notes
my-snake-game.my-snake-game  enabled  active   -
```

- **`Rev` 是 `x2`**：從 Snap Store 裝的套件，revision 是純數字（例如前面的 708、8763）；本機安裝的套件以 `x` 開頭，這是第二次安裝，所以是 `x2`。
- **服務已經啟動**：`Startup` 是 `enabled`（開機自動啟動）、`Current` 是 `active`（執行中）。不用開終端機，打開 `http://localhost:8099` 就能玩。

服務可以用 `snap` 指令停止或啟動：

```bash
sudo snap stop my-snake-game
sudo snap start my-snake-game
```

### 步驟 7：回滾到 1.0.0

本機安裝的套件一樣可以用 `snap revert` 回到上一個 revision：

```bash
sudo snap revert my-snake-game
snap list my-snake-game
sudo snap services my-snake-game
```

```text
my-snake-game 已恢復到 1.0.0
```

```text
Name           Version  Rev  Tracking  Publisher  Notes
my-snake-game  1.0.0    x1   -         -          -
```

```text
error: snap "my-snake-game" has no services
```

版本回到 1.0.0、`Rev` 回到 `x1`。1.0.0 的 `snapcraft.yaml` 沒有 `daemon`，所以回滾後背景服務也跟著消失，`snap services` 回應這個套件沒有服務，要玩就得像步驟 5 那樣在終端機執行 `my-snake-game`。

### 步驟 8：移除

```bash
sudo snap remove my-snake-game --purge
```

專案目錄 `~/my-snap-game` 不會跟著刪掉，不需要時再自己用 `rm -rf ~/my-snap-game` 刪除。

### 系列小結

四章下來，我從使用者走到打包者，對 Snap 的運作比較有概念了：

| 章節 | 學到的事 |
| --- | --- |
| 第 1 章 | Snap 以唯讀的 SquashFS 掛載，`current` 指向目前的 revision；strict 的套件要透過 plug／slot 拿權限 |
| 第 2 章 | 切換通道與回滾都是以 revision 為單位切換；snapd 停掉時，已經在跑的 LXD 與容器沒有受影響 |
| 第 3 章 | 用 `snap set` 調整 Nextcloud 的設定；一般移除會留下資料快照，要用 `snap forget` 清掉 |
| 第 4 章 | `snapcraft.yaml` 用 parts 組合程式與相依套件、apps 定義怎麼執行；加上 `daemon` 就成為 systemd 管理的服務 |
