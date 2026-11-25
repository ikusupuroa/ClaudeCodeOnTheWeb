---
title: Ubuntu 26.04 LTS 上架 Amazon WorkSpaces：Wayland 桌面、Rust 工具、後量子加密，每台都附 Ubuntu Pro
pubDate: 2026-11-25
canonicalTitle: Ubuntu 26.04 LTS is now available on Amazon WorkSpaces
canonicalUrl: https://canonical.com/blog/ubuntu-26-04-lts-is-now-available-on-amazon-workspaces
canonicalAuthor: Carlos Bravo
canonicalPubDate: 2026-11-24T20:20:57Z
sourceFeed: Canonical Blog
summary: Ubuntu 26.04 LTS（Resolute Raccoon）已經可以在 Amazon WorkSpaces Personal 選用，是第一個以 Wayland 為基礎的 Ubuntu WorkSpaces 版本。桌面用 GNOME 50，kernel 7.0，預設 sudo-rs 與 rust-coreutils，OpenSSH 預設混合式後量子金鑰交換，並內建 authd 雲端身分驗證。每台 Ubuntu 26.04 LTS WorkSpace 都包含 Ubuntu Pro 訂閱。
takeaway: 這篇把 26.04 LTS 的幾個主要改變，放到「雲端桌面」這個情境來看：開發者工具大幅升級、系統基礎改用 Rust、SSH 預設後量子加密、登入可以接企業的身分系統。對管理 WorkSpaces 的人來說，最實際的是 authd 加上每台都附 Ubuntu Pro。原文沒有說明 Wayland 桌面在 WorkSpaces 上的使用體驗，也沒有說明從舊版升級的方式。
tags:
  - Ubuntu
  - Cloud
  - AWS
---

## ikusupuroa 觀點

### 1. 先懂幾個名詞

- **Amazon WorkSpaces**：AWS 的雲端桌面服務，使用者透過網路連到雲端上的桌面。原文講的是其中的 WorkSpaces Personal。
- **Wayland**：Linux 桌面的顯示系統，用來取代老牌的 X11。
- **GNOME**：Ubuntu 預設的桌面環境。
- **sched_ext**：kernel 7.0 加入的功能，可以把排程策略寫成 eBPF 程式（在 kernel 裡執行的小程式）。
- **sudo-rs、rust-coreutils**：用 Rust 重寫的 `sudo` 與基本指令工具。Rust 語言的設計能避免整類記憶體安全問題。
- **後量子密碼學**（post-quantum cryptography）：設計來抵抗未來量子電腦的加密演算法。原文提到的 ML-KEM、ML-DSA、SLH-DSA 都屬於這一類。
- **authd**：Ubuntu 的雲端身分驗證服務，讓使用者用企業的身分系統登入 Ubuntu。
- **OIDC**（OpenID Connect）：常見的身分驗證協定，Google、Microsoft 等身分提供者都支援。
- **Ubuntu Pro**：Canonical 的訂閱服務，提供安全維護與支援。本站之前的〈[Ubuntu Pro 在 AWS 上的升級](../ubuntu-pro-aws-upgrade/)〉介紹過在 AWS 上取得它的方式。

### 2. 值得注意的地方：每一台都附 Ubuntu Pro

原文有一句很容易被略過：每一台 Ubuntu 26.04 LTS WorkSpace 都包含 Ubuntu Pro 訂閱，涵蓋作業系統和數千個開源套件的安全維護。如果公司本來就要為雲端桌面另外處理安全更新，這代表選用這個映像檔，就同時取得維護範圍。至於 Pro 的哪些功能可以用、授權方式怎麼算，原文沒有細講。

### 3. 值得注意的地方：登入可以接企業的身分系統

原文用一節介紹 authd：它現在可以直接從 Ubuntu 軟體庫安裝，除了支援 Microsoft Entra ID（並新增裝置註冊），也支援 Google IAM 和任何 OIDC 身分提供者。管理者還可以指定裝置擁有者，並要求每次登入都向身分提供者做存取檢查。

帳號怎麼和公司的身分系統接起來，是管理雲端桌面時一定會碰到的事，這項功能比 kernel 版本更貼近日常維運。這是我的判斷，原文沒有這樣比較。

### 4. 安全方面的三個預設

原文把安全性的改進歸成三類：

- **Rust 化**：`sudo` 預設用 sudo-rs，核心工具來自 rust-coreutils。本站的〈[Ubuntu 26.10 資安總整理](../ubuntu-26-10-security/)〉也談過 Rust 化這條路線。
- **後量子加密預設開啟**：OpenSSH 10.2 預設使用混合式後量子金鑰交換，OpenSSL 支援 ML-KEM、ML-DSA 與 SLH-DSA。
- **更多沙箱**：AppArmor 新增許多應用程式的設定檔，限制被攻擊時的影響範圍。

### 5. 開發者的角度

原文用一張表比較 24.04 與 26.04 的工具鏈版本，整整跳了兩年。原文也提到 OpenJDK 8、11、17、21 仍然保留，給舊專案用；APT 3.1 新增了交易紀錄，可以用一個指令查看、復原或退回套件變更。

最後一段講「代理式開發」：把 AI 寫程式的代理放在 WorkSpaces 裡的沙箱執行，桌面本身不受影響。原文介紹了 Canonical Workshop（用一個 YAML 檔建立隔離、可重複的開發環境）和 Kiro SDK（在 workshop 設定檔加三行就能加入 AWS 的 Kiro CLI）。這部分本站沒有實測。

### 6. 還有哪些疑問

> **待確認**：原文沒有說明 Ubuntu Pro 在 WorkSpaces 的授權方式，也沒有列出涵蓋哪些功能（例如 Livepatch、ESM）。

> **待確認**：原文沒有說明 Wayland 桌面在 WorkSpaces 的遠端連線下實際的使用體驗，也沒有說明和舊版 Ubuntu 桌面相比有哪些差異。

> **待確認**：原文只說「建立新的 Linux WorkSpace 時選用」，沒有說明既有的 24.04 WorkSpace 能不能原地升級。

## 原文精華導讀

### 重點

- Ubuntu 26.04 LTS（Resolute Raccoon）現在可以在 Amazon WorkSpaces Personal 使用，是第一個以 Wayland 為基礎的 Ubuntu WorkSpaces 版本。
- 帶來 Linux kernel 7.0、記憶體安全的系統工具、後量子密碼學，以及新一代開發工具鏈。
- 每一台 Ubuntu 26.04 LTS WorkSpace 都包含 Ubuntu Pro 訂閱。

### Wayland 桌面與 GNOME 50

- WorkSpaces 的桌面是 GNOME 50 加上 Wayland，渲染更順，預設啟用分數縮放，桌面主要元件的 CPU 與記憶體使用量也降低。
- 預設應用程式更新：新的終端機 Ptyxis 可以快速進入容器；Resources 監控工具會按應用程式分組顯示行程。

### Linux kernel 7.0

- 加入 sched_ext，排程策略可以寫成 eBPF 程式。
- 預設啟用 kernel 當機傾印（crash dump），方便排除問題。

### 記憶體安全與後量子密碼學

| 項目 | 原文的說明 |
| --- | --- |
| Rust 化 | sudo-rs 為預設的 sudo，核心工具來自 rust-coreutils，兩者都排除了特權程式碼中整類記憶體安全錯誤 |
| 後量子預設 | OpenSSH 10.2 預設使用混合式後量子金鑰交換；OpenSSL 支援 ML-KEM、ML-DSA、SLH-DSA |
| 更多沙箱 | AppArmor 新增許多應用程式設定檔，限制受攻擊時的影響 |

### 內建的雲端身分驗證

- authd 現在可以直接從 Ubuntu 軟體庫安裝。
- 除了 Microsoft Entra ID（新增裝置註冊），也支援 Google IAM 與透過通用 broker 連接的任何 OIDC 提供者。
- 管理者可以指定裝置擁有者，並在每次登入時要求向身分提供者做存取檢查。

### 開發工具鏈

| 工具 | Ubuntu 24.04 LTS | Ubuntu 26.04 LTS |
| --- | --- | --- |
| Python | 3.12 | 3.14 |
| OpenJDK（預設） | 21 | 25 |
| .NET | 8 | 10 |
| GCC | 14 | 15.2 |
| LLVM | 18 | 21 |
| Rust | 1.75 | 1.93 |
| Go | 1.22 | 1.25 |

- OpenJDK 8、11、17、21 仍可使用；Zig 首次加入軟體庫。
- APT 3.1 新增交易紀錄，可以用一個指令查看、復原或退回套件變更。

### 為代理式開發做好準備

- AI 程式碼代理放在 WorkSpaces 的沙箱裡運作效果最好。
- Canonical Workshop 可以用單一 YAML 檔啟動隔離、可重複的開發環境，讓你控制代理能接觸的範圍，桌面不受影響。
- Workshop 的 Kiro SDK 用三行設定，就能把 AWS Kiro CLI 加進 workshop。

### 開始使用

- 建立新的 Linux WorkSpace 時，選擇受管理的 Ubuntu 26.04 LTS bundle。
- 提供 Standard、Performance、Power、PowerPro 四種規格，所有有提供 Amazon WorkSpaces 的 AWS 區域都能使用。
- 原文另附支援作業系統清單與價格頁面的連結。

### 出處

- 原文：[Ubuntu 26.04 LTS is now available on Amazon WorkSpaces](https://canonical.com/blog/ubuntu-26-04-lts-is-now-available-on-amazon-workspaces)（Carlos Bravo，Canonical Blog，2026 年 11 月 24 日）
- 原文提到的延伸閱讀：[Ubuntu 26.04 LTS release notes](https://documentation.ubuntu.com/release-notes/26.04/summary-for-lts-users/)、[Bundles and images for WorkSpaces Personal](https://docs.aws.amazon.com/workspaces/latest/adminguide/amazon-workspaces-bundles.html)（AWS 文件）
