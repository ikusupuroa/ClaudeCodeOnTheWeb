# 02. Nextcloud Snap 實戰操作指南（Port 10081、UFW 防火牆與殘留快照清理）

本手冊為 Canonical Snap 的 **Nextcloud 私有雲端硬碟**生產級實務指南。
所有步驟均在 Ubuntu 實機環境下經過端到端驗證通過，涵蓋：舊版安裝、自訂 HTTP 埠號至 **`10081`**、UFW 防火牆安全治理、非標準 Port 信任網域配置、版本升級與回滾（Revert）、以及移除後快照（Snapshot）的徹底銷毀。

---

## 完整實戰流程（7 大核心步驟）

### 步驟 1：查詢可用的版本軌道（Channels）
```bash
snap info nextcloud
```
*可在輸出中檢視所有維護中的大版本軌道（如 `latest/stable`、`28/stable`、`27/stable` 等）。*

---

### 步驟 2：安裝指定的舊版本（例如 27 長期支援版）
```bash
# 透過 --channel 指定安裝 27 軌道
sudo snap install nextcloud --channel=27/stable

# 驗證安裝狀態與目前版本號
snap list nextcloud
```

---

### 步驟 3：修改 Port 為 10081 並配置 UFW 防火牆

> [!CAUTION]
> **避開瀏覽器黑名單 Port 10080**：
> 全球主流瀏覽器（Firefox、Chrome、Edge、Safari）已將 `10080` 列入 NAT Slipstreaming 2.0 防禦黑名單，瀏覽器會直接阻斷連線。本指南採用合法且無限制的 **`10081`**。

#### 3.1 修改 Nextcloud 監聽埠號
```bash
# 將 HTTP 連接埠設定為 10081
sudo snap set nextcloud ports.http=10081

# 驗證設定值是否已生效
sudo snap get nextcloud ports.http
```

#### 3.2 在 UFW 防火牆放行 10081 通訊埠
```bash
# 開啟 10081/tcp 通訊埠
sudo ufw allow 10081/tcp comment 'Nextcloud Snap HTTP Port'

# 檢查 UFW 防火牆狀態與目前規則
sudo ufw status verbose
```
> [!NOTE]
> 執行 `ufw allow` 後，Linux 核心防火牆會**即時動態生效（Live update）**，**不需要**額外執行 `sudo ufw reload`。

---

### 步驟 4：初始化設定管理者帳號

```bash
# 一行指令完成資料庫初始化與管理員帳號建立
sudo nextcloud.manual-install admin Password123
```

---

### 步驟 5：配置信任網域與轉址規則（非標準 Port 必備）

> [!IMPORTANT]
> **核心觀念釐清**：
> 1. `trusted_domains` 是比對訪客網址列輸入的**「伺服器自己的門牌號碼（Host 標頭）」**，不是訪客的電腦 IP。因此只需要填入伺服器本機的真實 IP。
> 2. 當使用非標準連接埠（非 80 / 443）時，瀏覽器發送的 HTTP Host 標頭會帶有連接埠（即 `<IP>:10081`）。官方規範要求 `trusted_domains` 必須**明確包含 `:10081`**，否則會被拒絕連線！

```bash
# 1. 查出這台機器的真實 IP（例如 192.168.50.25）
hostname -I | awk '{print $1}'

# 2. 將包含 :10081 的完整位址加入信任清單（將範例 IP 換成您的真實 IP）
sudo nextcloud.occ config:system:set trusted_domains 1 --value="192.168.50.25:10081"

# 3. 備用：保留不帶 port 的純 IP
sudo nextcloud.occ config:system:set trusted_domains 2 --value="192.168.50.25"

# 4. 強制內部重定向指向正確的 Port 10081（官方 Wiki 推薦）
sudo nextcloud.occ config:system:set overwritehost --value="192.168.50.25:10081"
sudo nextcloud.occ config:system:set overwrite.cli.url --value="http://192.168.50.25:10081"

# 5. 驗證目前的信任清單
sudo nextcloud.occ config:system:get trusted_domains
```

#### 瀏覽器連線登入：
在瀏覽器（Firefox、Chrome 等）網址列輸入：
```text
http://192.168.50.25:10081
```
輸入帳號 `admin` 與密碼 `Password123` 即可順利進入系統。

---

### 步驟 6：版本跨軌道升級與一秒回滾（Revert）

1. **跨大版本升級（例如切換至 28 軌道）**：
   ```bash
   sudo snap refresh nextcloud --channel=28/stable
   ```
   *系統將自動更新 SquashFS 映像並完成內部資料庫遷移，所有設定（Port 10081、資料、管理者帳號）均會自動保留。*

2. **升級異常時的回滾（Rollback）**：
   若新版本異常或外掛不相容，直接執行還原：
   ```bash
   sudo snap revert nextcloud
   ```
   *系統將於數秒內瞬間倒退回先前的 27 版，包含設定、Port 10081 與資料均完好如初。*

---

### 步驟 7：軟體移除、殘留快照徹底清理與防火牆撤銷

當不再需要使用 Nextcloud 時，請依照標準生命週期進行清理：

#### 7.1 關閉並刪除 UFW 防火牆的 10081 規則
```bash
sudo ufw delete allow 10081/tcp
sudo ufw status verbose
```

#### 7.2 移除 Nextcloud Snap 套件
```bash
# 情況 A：若要一開始就徹底清空、不留任何備份
sudo snap remove nextcloud --purge

# 情況 B：若執行了普通移除（系統會提示 snap data snapshot saved）
sudo snap remove nextcloud
```

#### 7.3 徹底銷毀殘留的 Snap 快照（Snapshot）
若先前執行的是普通移除，硬碟中會保留一份資料備份快照：
```bash
# 1. 查詢殘留快照的編號（Set ID）與佔用空間
snap saved

# 輸出範例：
# Set  Snap       Age    Version       Rev    Size    Notes
# 5    nextcloud  60.0s  27.1.11snap1  44288  46.4MB  auto

# 2. 徹底銷毀該快照（將 5 換成您實際看到的 Set 編號）
sudo snap forget 5

# 3. 再次確認已完全釋放空間
snap saved
```

---

## 常見問題與排錯重點

### 1. 瀏覽器受限連接埠（Restricted Port 10080）
- **現象**：終端機 `curl -I http://192.168.50.25:10080` 正常回應 `HTTP/1.1 302 Found`，但 Firefox / Chrome 卻直接顯示「此網址受到限制（This address is restricted）」或「連線失敗」。
- **原因**：Port 10080 是 Amanda 備份協定專用埠，各大瀏覽器為了防範 **NAT Slipstreaming 2.0 路由器穿透攻擊**，直接在瀏覽器核心代碼中硬編碼封鎖了 10080。
- **解法**：切勿使用 `10080`，改用合法無限制的高位埠（如 `10081`）。

### 2. `curl` 存取未輸出內容的原因
- **現象**：執行 `curl http://192.168.50.25:10081` 終端機沒有任何輸出直接換行。
- **原因**：Nextcloud 根目錄預設回傳 `HTTP 302 Found` 轉址到 `/index.php/login`，且 HTTP Body 長度為 0。
- **解法**：使用 `curl -I` 查看 HTTP Header 狀態，或使用 `curl -L` 自動追蹤重定向。

### 3. UFW 防火牆何時才需要 `reload`？
- **純 CLI 增刪規則（如 `ufw allow` / `ufw delete`）**：**不需要 `ufw reload`**，核心鏈會立即生效。
- **手動修改底層設定檔（如 `/etc/ufw/before.rules` 做 NAT 轉發）**：才必須執行 `sudo ufw reload`。

### 坑 4：`remove --purge` 對已移除套件無效
- 若已先執行了 `snap remove nextcloud`，隨後再下 `snap remove nextcloud --purge` 會報錯 `snap is not installed`。
- 此時殘留的快照必須透過 `snap saved` 搭配 `sudo snap forget <Set ID>` 才能真正銷毀。
