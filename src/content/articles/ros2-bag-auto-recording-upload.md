---
title: 機器人資料不再漏錄：用 ros2-exporter-agent 自動錄製並上傳 ROS 2 bag
pubDate: 2026-11-04
canonicalTitle: "Never lose robot data again: automatic ROS 2 bag recording and upload"
canonicalUrl: https://canonical.com/blog/never-lose-robot-data-again-automatic-ros-2-bag-recording-and-upload
canonicalAuthor: gbeuzeboc
canonicalPubDate: 2026-11-03T16:02:04Z
sourceFeed: Canonical Blog
summary: 手動執行 ros2 bag record、再用 scp 把好幾 GB 的檔案拷下機器人，規模一大就做不下去。Canonical 介紹 ros2-exporter-agent snap：在機器人上持續錄製 ROS 2 topic，每兩分鐘用 rclone 自動上傳到伺服器，伺服器可以是 SFTP 主機或 S3 相容儲存；機隊則可以用另一個設定 snap 統一派送設定。
takeaway: 這篇解決的是很實際的痛點：最重要的那次測試，常常就是沒人錄到的那次。ros2-exporter-agent 把「錄製、上傳、清理」交給機器人自己做，上傳端用 rclone，從實驗室主機換到雲端只要改設定。不過它目前在 candidate channel，本機的 bag 只當短暫暫存，伺服器長時間連不上時會怎樣，原文沒有交代清楚。
tags:
  - Robotics
  - Ubuntu
---

## ikusupuroa 觀點

### 1. 先懂兩個名詞：ROS 2 bag 與 snap

- **ROS 2**（Robot Operating System 2）是開發機器人軟體的框架，各個元件透過 topic（主題）互相傳遞感測器資料與指令。
- **ROS 2 bag** 是 topic 的錄製檔，事後可以重播、分析。這個工具錄成 [MCAP](https://mcap.dev/) 格式。
- **snap** 是 Ubuntu 的套件格式，把程式和相依套件打包在一起。ros2-exporter-agent 就是一個 snap，在機器人上跑四個小服務。

### 2. 原文點出的痛點很真實

原文描述的情境是：最重要的那次實地測試沒人錄到；或是錄到了，但 bag 檔還留在遠方客戶現場的機器人裡。手動 `ros2 bag record` 再用 `scp` 拷貝好幾 GB 的檔案，機器人一多就做不下去，還可能漏同步或不小心覆蓋。

如果是台灣在工廠、倉儲現場測試 AMR（自主移動機器人）的團隊，機器人常常在客戶廠區而不在自己公司，這種「讓機器人自己錄、自己傳」的做法應該很實用。這段情境是本站補充。

### 3. 設計上值得學的地方：上傳目的地抽象成一個名字

不管後端是 SFTP 主機還是 S3，snap 永遠上傳到 rclone 裡叫 `bagstore` 的 remote（遠端儲存設定），`bagstore` 再用 alias（別名）指到真正的後端。所以換儲存位置只要改設定檔，程式邏輯不變。這個「固定名稱、後端可替換」的做法，跟之前 [KubeCon 那篇](../kubernetes-ai-agents-kubecon-na-2026/)提到用 OpenAI 相容 API 讓模型可以替換，是類似的思路。後面這個類比是本站補充。

### 4. 要留意的地方

- **安裝的是 `latest/candidate` channel**：原文的安裝指令用的是 candidate（候選版），不是 stable（穩定版），放到正式機隊前要先評估。
- **本機只當短暫暫存**：原文說 auto-clean 會刪掉超過 10 分鐘的本機檔案，本機的 bag 只是短暫的暫存區；專案的 [README](https://github.com/canonical/ros2-exporter-agent) 則寫 auto-clean 刪除的是「已經同步」的本機 bag。
- **機器人時間要對**：README 提醒，每日輪替是在午夜進行，要先用 `timedatectl status` 確認機器人的時間設定正確。這點原文沒寫，是本站從 README 補充的。

### 5. 還有哪些疑問

> **待確認**：伺服器連不上超過 10 分鐘時，還沒上傳的 bag 會不會被 auto-clean 刪掉？原文的「超過 10 分鐘就刪」和 README 的「刪除已同步的」兩種說法，沒有說明怎麼搭配。

> **待確認**：原文 S3 範例的 `bagstore` alias 少了 `remote` 這一行；README 的範例有寫，例如 `remote = s3:my-bucket/robot-123`。另外原文 SFTP 範例的金鑰路徑在 `/root/snap/...`，README 則建議放在 `/var/snap/ros2-exporter-agent/common/`，實際設定時以 README 為準比較保險。

## 原文精華導讀

### ros2-exporter-agent 做什麼

這個 snap 在機器人上跑四個互相配合的服務：

| 服務 | 功能 |
| --- | --- |
| recorder | 把 ROS 2 topic 錄成 MCAP bag，依時間或大小切檔 |
| synchronization | 每兩分鐘用 [rclone](https://rclone.org/) 嘗試上傳 bag |
| daily-rotation | 每天午夜重新開始錄製，讓 bag 依日期分組 |
| auto-clean | 刪除超過 10 分鐘的本機檔案，避免磁碟被舊 bag 塞滿 |

- 設計時就考慮了安全：auto-clean 開始運作後才會開始錄製。
- 伺服器短暫連不上時，同步服務會自動重試上傳。

### 伺服器放哪裡都可以

- 伺服器可以是機器人現場的區域網路主機、公司自架的伺服器，或雲端主機。
- 上傳端就是 rclone，支援 40 種以上的[儲存後端](https://rclone.org/docs/#configure)。snap 一律上傳到名為 `bagstore` 的 rclone remote，從實驗室伺服器換到 AWS S3 只是改設定。

SFTP 主機的範例（原文）：

```ini
[fileserver]
type = sftp
host = bags.robot-company.com
user = robot
port = 22
key_file = /root/snap/ros2-exporter-agent/common/device_rsa_key

[bagstore]
type = alias
remote = fileserver:/srv/bags/robot-01
```

S3 相容儲存（AWS、Ceph、MinIO 等）的範例（原文）：

```ini
[s3store]
type = s3
provider = Ceph
access_key_id = <access-key>
secret_access_key = <secret-key>
endpoint = https://s3.robot-company.com

[bagstore]
type = alias
```

第一段依後端不同而不同，但 `bagstore` 這個 alias 永遠不變；不管管理一台還是一百台、用 SSH 還是 S3，snap 的邏輯都一樣。

### 幾分鐘設定好一台機器人

安裝：

```bash
sudo snap install ros2-exporter-agent --channel latest/candidate
```

- 安裝後，snap 會在 `/var/snap/ros2-exporter-agent/common/local-configuration/` 建立兩個範本檔，把 `.template` 字尾去掉後再編輯：
  - `rclone.conf`：bag 要上傳到哪裡，用上面任一種後端。
  - `rosbag2-recorder.yaml`：要錄什麼、包含或排除哪些 topic、多久切一個檔。
- 兩種格式的說明與範例見 [README 的設定章節](https://github.com/canonical/ros2-exporter-agent#configuration)。
- 兩個檔案就位後，服務會自動讀取，機器人就開始自己錄製與上傳。

### 機隊的集中設定

- 每台機器人各自改檔案，規模大了就不好管。snap 也可以透過 [content interface](https://snapcraft.io/docs/content-interface)（snap 之間共享內容的介面）讀取設定：另一個設定 snap 存放 `rclone.conf` 與 `rosbag2-recorder.yaml`，連上它的機器人都會拿到同一套設定。
- [rob-cos-demo-configuration](https://github.com/canonical/rob-cos-demo-configuration) 是現成的範例，`basic` 分支用 SFTP 檔案伺服器，`advanced` 分支用 S3 相容儲存。
- 這個設定 snap 還內建一些自動化，例如為每台設備產生 UID 並套用到設定裡。
- Fork 之後改成自己的伺服器資訊、建置自己的設定 snap；之後只要更新一次設定，整個機隊都會收到。

### 進一步的應用

- **把 bag 拉到筆電**：包一個 `rclone copy` 的小腳本，讓工程師一個指令就能抓到某台機器人昨天的 bag。
- **用網頁瀏覽 bag**：在儲存前面放一個輕量的檔案瀏覽器，讓大家從瀏覽器找檔、下載。
- **直接從儲存開啟**：[Foxglove](https://snapcraft.io/foxglove-studio) 這類工具可以用網址載入遠端的 MCAP 檔，不用先下載就能檢視。

### 出處

- 原文：[Never lose robot data again: automatic ROS 2 bag recording and upload](https://canonical.com/blog/never-lose-robot-data-again-automatic-ros-2-bag-recording-and-upload)（Canonical Blog，gbeuzeboc，2026-11-03）
- 專案：[canonical/ros2-exporter-agent](https://github.com/canonical/ros2-exporter-agent)、[Snap Store](https://snapcraft.io/ros2-exporter-agent)
- 設定範例：[canonical/rob-cos-demo-configuration](https://github.com/canonical/rob-cos-demo-configuration)
