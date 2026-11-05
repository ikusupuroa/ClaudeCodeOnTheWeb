# 03. Snapcraft 實戰打包指南：從零製作並發布自己的 Snap 網頁遊戲

> **官方來源**：
> - Snapcraft 官方打包教學：[Creating a snap](https://snapcraft.io/docs/creating-a-snap)
> - 藍圖參考手冊：[The snapcraft.yaml schema](https://snapcraft.io/docs/snapcraft-yaml-reference)
> - 零件外掛指南：[Snapcraft plugins](https://snapcraft.io/docs/snapcraft-plugins)
> - 服務與守護進程：[Services and daemons](https://snapcraft.io/docs/services-and-daemons)

---

## 前言：為什麼要自己動手打包 Snap？

這份指南說明如何使用 Snapcraft 將自製程式打包為 Snap 套件。內容以單頁 HTML5 貪食蛇網頁遊戲為範例，涵蓋原始碼準備、`snapcraft.yaml` 規格配置、編譯打包、本機安裝測試，以及將應用配置為 systemd 背景服務的步驟。

---

## 第 1 章：Snap 打包核心思維與環境準備

### 1.1 【白話說明】Snap 打包的「建築藍圖」：`snapcraft.yaml`

> [!IMPORTANT]
> **觀念釐清：開發工作區 vs 系統運行目錄**
> - **先前的我們是「使用者」**：我們安裝別人已經發布的軟體，軟體被掛載在 `/snap/<app>`（唯讀），專屬資料存放在 `/var/snap/<app>`。
> - **打包與安裝的目錄差異**：在打包階段，專案原始碼與設定檔存放在開發工作目錄（如家目錄下的 `~/my-snap-game`）。只有在完成打包並執行 `snap install` 後，系統才會將產出的 `.snap` 唯讀掛載至 `/snap/my-snake-game`。

如果把打包 Snap 比喻成**「組裝一盒樂高玩具」**，那麼 `snapcraft.yaml` 就是**組裝說明書**。整份說明書由四大核心板塊構成：

1. **Metadata（身分證資料）**：定義軟體名稱（`name`）、版本號（`version`）、一句話簡介（`summary`）與完整描述（`description`）。
2. **Base（基礎系統）**：指定這盒玩具要蓋在誰的地基上（例如 `base: core22`，代表基於 Ubuntu 22.04 LTS 最小系統）。
3. **Parts（零件與材料）**：說明軟體原始碼在哪裡？用什麼工具烹飪（`plugin`）？需要哪些額外的系統零件（`stage-packages`）？
4. **Apps（啟動開關與服務）**：安裝好之後，使用者輸入什麼指令開打？需不需要在開機時當作背景服務（`daemon`）？需要哪些插頭權限（`plugs`）？

---

### 1.2 【動手實作】安裝 `snapcraft` 並建立專案工作區

打包 Snap 需要使用 Canonical 官方的專屬工具 **`snapcraft`**。

請在您的終端機輸入：

```bash
# 1. 安裝 Snapcraft 工具（需使用 --classic 傳統權限，因為它需要編譯與存取檔案）
sudo snap install snapcraft --classic

# 2. 驗證安裝成功
snapcraft --version

# 3. 建立並進入我們這次的專案目錄
mkdir -p ~/my-snap-game
cd ~/my-snap-game
```

---

## 第 2 章：打造我們的網頁遊戲（前端靜態資源）

### 2.1 【白話說明】為什麼選擇「零依賴」的純 HTML5 遊戲？

在學習打包的初期，最忌諱引入過多複雜的編譯依賴（如 Webpack、npm、重型 C++ 依賴），那會讓除錯變得極其痛苦。
我們選擇一個**純 HTML5 + CSS + JavaScript 撰寫的貪食蛇遊戲**：
- 零建構步驟（Zero-build，不需要 npm install）。
- 內建畫布（Canvas）、計分板與鍵盤上下左右監聽。
- 搭配 Python 3 內建的輕量 HTTP Server，直接把遊戲發布成 Web 服務！

---

### 2.2 【動手實作】撰寫遊戲原始碼（`index.html`）

在專案目錄下建立 `src/` 資料夾，並寫入遊戲檔案：

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

---

## 第 3 章：撰寫打包設定檔 ── `snapcraft.yaml`

### 3.1 【白話說明】拆解專屬的 YAML 設定項目

為了讓這個網頁遊戲能被任何 Linux 執行，我們需要：
1. **`dump` Plugin（傾倒外掛）**：直接把本機 `src/` 目錄裡的檔案，原封不動搬運進 Snap 封裝包的內部。
2. **`stage-packages: [python3-minimal]`**：告訴 Snapcraft，在打包時順便從 Ubuntu 官方庫裡把最小版的 Python 3 抓下來塞進去（自帶執行環境，使用者電腦沒裝 Python 也一樣能跑！）。
3. **`network-bind` 插頭**：在嚴格沙盒（Strict Confinement）下，程式想要監聽本機連接埠（例如 8099），必須宣告 `network-bind` 權限插頭。
4. **`$SNAP` 環境變數**：在 Snap 運行時，`$SNAP` 代表套件被掛載的唯讀目錄路徑。

---

### 3.2 【動手實作】建立啟動腳本與 `snapcraft.yaml`

#### 步驟 A：建立伺服器啟動腳本
在專案根目錄建立 `launcher.sh`：

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

---

#### 步驟 B：建立 `snap/snapcraft.yaml` 藍圖檔案
Snapcraft 規定藍圖檔案必須放在專案的 `snap/` 資料夾下：

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

---

## 第 4 章：一鍵建置與打包（From Code to `.snap`）

### 4.1 【白話說明】建置環境的選擇（容器隔離 vs 本機直接編譯）

在現代 Snapcraft 中，預設會使用 **LXD 容器**在背景自動開一台隔離環境來進行編譯打包，確保不會搞髒您的主機。
- **標準容器模式（預設）**：`snapcraft`（自動呼叫 LXD 容器進行無污染編譯）。
- **本機破壞性模式（Destructive Mode）**：`snapcraft --destructive-mode`（直接在當前實體機快速編譯，跳過容器啟動時間，最適合單純的腳本或輕量應用）。

---

### 4.2 【動手實作】執行打包並產出 `.snap` 檔案

在 `~/my-snap-game` 目錄下執行打包指令：

```bash
cd ~/my-snap-game

# 執行打包（建議直接使用本機快速模式，約 30~60 秒完成）
# 註：Snapcraft 9.2+ 官方推薦使用 'snapcraft pack'
snapcraft pack --destructive-mode
```

#### 實機終端機建置日誌（實測通過）：
```text
Running snapcraft without a command will not be possible in future releases. Use 'snapcraft pack' instead.
Generated snap metadata
Lint warnings:
- metadata: Metadata field 'title' is missing or empty.
...
Created snap package my-snake-game_1.0.0_amd64.snap
```

完成後，輸入 `ls -lh *.snap`：
您會看到一個名為 **`my-snake-game_1.0.0_amd64.snap`**（約 4~6MB）的二進位檔案誕生在目前目錄中！這就是您的第一個成果！

---

## 第 5 章：本機安裝測試與實際遊玩！

### 5.1 【白話說明】為什麼安裝本機 `.snap` 必須加上 `--dangerous`？

平常我們從 Snap Store 官方商店下載軟體時，每個 Snap 都有 Canonical 原廠的加密數位簽章。
但這是我們剛在自己電腦上手工編譯出來的，**還沒有上傳到商店取得官方簽章**。
因此，系統要求管理者必須加上 **`--dangerous`（已知風險）** 參數，代表「我知道這是我自己寫的檔案，我信任它」！

---

### 5.2 【動手實作】安裝自製 Snap、開啟瀏覽器開打！

```bash
# 1. 本機安裝剛才打包好的 Snap
sudo snap install ./my-snake-game_1.0.0_amd64.snap --dangerous

# 2. 驗證是否出現在 snap 清單中
snap list my-snake-game
```

#### 啟動遊戲！
直接在終端機輸入軟體名稱：

```bash
my-snake-game
```

終端機會顯示：
```text
==========================================================
  Canonical Snap 復古貪食蛇網頁遊戲已在背景啟動！
  請開啟瀏覽器連線： http://localhost:8099
  (按 Ctrl+C 可隨時關閉遊戲伺服器)
==========================================================
Serving HTTP on 0.0.0.0 port 8099 (http://0.0.0.0:8099/) ...
```

👉 **打開瀏覽器**：輸入 `http://localhost:8099`，您會看見色彩鮮明的 Ubuntu 風格像素貪食蛇！用鍵盤方向鍵上下左右開打！

---

## 第 6 章：進階配置 ── 設定為開機自啟的背景服務（Daemon）

### 6.1 【白話說明】從「命令行程式」變成「像 Nextcloud 一樣的伺服器」

剛才我們啟動遊戲時，終端機會被佔用（按 Ctrl+C 遊戲就關閉了）。
如果這是一個要部署在邊緣伺服器或 Kiosk 觸控螢幕上的工業遊戲服務，我們希望它**開機自動在背景運行、當機自動重啟**，該怎麼做？

在 `snapcraft.yaml` 的 app 定義中加入 `daemon: simple`：

---

### 6.2 【動手實作】修改藍圖升級為 Daemon 服務

#### 步驟 A：更新 `snap/snapcraft.yaml`
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

#### 步驟 B：重新打包並「本機升級更新」

> [!NOTE]
> **為什麼本機檔案更新依然使用 `snap install` 指令？**
> 在 Snap 的架構中：
> - `snap refresh` 是專門向雲端「Snap Store 商店」拉取線上更新用的。
> - 對於我們**在本機自己編譯的離線 `.snap` 檔案**，官方標準的更新語法就是再次執行 `snap install <新檔名.snap> --dangerous`。
> - **這絕不是砍掉重裝**！Snap 偵測到同名套件已存在時，底層執行的 100% 是**「無損版本升級（In-place Upgrade）」**：它會保留所有資料、疊加 Revision、並支援隨時 `revert` 回滾！

```bash
# 1. 重新打包 1.1.0 版
snapcraft pack --destructive-mode

# 2. 執行本機無損升級更新（將 1.0.0 升級為 1.1.0）
sudo snap install ./my-snake-game_1.1.0_amd64.snap --dangerous

# 3. 驗證版本已升級至 1.1.0，Revision 疊加為 x2！
snap list my-snake-game

# 4. 檢查系統服務狀態
sudo snap services my-snake-game
```

#### 實機升級輸出：
```text
vincent@vincent-ubuntu:~/my-snap-game$ snap list my-snake-game
Name           Version  Rev  Tracking  Publisher  Notes
my-snake-game  1.1.0    x2   -         -          -

vincent@vincent-ubuntu:~/my-snap-game$ sudo snap services my-snake-game
Service                      Startup  Current  Notes
my-snake-game.my-snake-game  enabled  active   -
```

> [!TIP]
> **深入底層發現：本機套件的 `x1`、`x2` 流水號**：
> 在 Snap Store 下載的套件，Rev 是純數字流水號（如 708、8763）；而我們**在本機自己編譯的 Snap，Rev 會以 `x` 開頭標記（如 `x1` ➜ `x2`）**！
> 升級到 1.1.0 後，因為藍圖加入了 `daemon: simple`，系統已自動將其註冊為 systemd 開機自啟服務，完全無需打開終端機，隨時開瀏覽器隨時玩！若執行 `sudo snap revert my-snake-game`，也能隨時秒速倒退回 1.0.0 (x1)！

#### 終端機輸出：
```text
Service                      Startup  Current  Notes
my-snake-game.my-snake-game  enabled  active   -
```
它已經成為一個由 systemd 守護的**全功能後台服務**！您不用開任何終端機，隨時隨地用瀏覽器打開 `http://localhost:8099` 都能暢玩！

```bash
# 隨時可以用 snap 指令停止或啟動它：
sudo snap stop my-snake-game
sudo snap start my-snake-game
```

---

## 第 7 章：乾淨卸載與完全清理

實作體驗完畢後，依照標準流程徹底清除：

```bash
# 1. 徹底移除自製 Snap 套件（連快照備份都不留）
sudo snap remove my-snake-game --purge

# 2. （可選）刪除打包專案原始碼目錄
# rm -rf ~/my-snap-game
```

---

## 打包流程重點回顧

1. **設定檔定義**：在 `snapcraft.yaml` 宣告 Base 基底、零件來源與所需權限。
2. **相依處理**：透過 `dump` 複製原始碼，使用 `stage-packages` 引入執行時相依套件。
3. **打包產出**：執行 `snapcraft pack` 產出二進位 `.snap` 檔案。
4. **服務型態**：可視需求透過 `daemon` 屬性將應用程式配置為背景守護行程。
