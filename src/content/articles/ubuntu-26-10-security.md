---
title: Ubuntu 26.10 資安總整理：精簡 GRUB、OpenSSL 4.0、全面 Rust 化，升級前要先檢查這些地方
pubDate: 2026-10-24
canonicalTitle: What’s new in security for Ubuntu 26.10?
canonicalUrl: https://ubuntu.com/blog/ubuntu-26-10-security
canonicalAuthor: Ijlal Loutfi
canonicalPubDate: 2026-10-06T14:19:19Z
sourceFeed: Ubuntu Blog
summary: Ubuntu 26.10 的資安主軸是「減少可被攻擊的程式碼」：簽章版 GRUB 移除多種檔案系統與影像解析器，核心工具全面改用 Rust，並升級到 OpenSSL 4.0 與 OpenSSH 10.5。同時加入 upki 憑證撤銷檢查、以 dbus-broker 取代 dbus-daemon，並強化 Microsoft MFA 登入與硬體金鑰 VPN 支援。
takeaway: 這一版的方向就是 28.04 LTS 的預告，台灣企業現在該做的是「提早盤點相容性」：/boot 用了 LVM、LUKS 或軟體 RAID 的標準映像檔、靠 OpenSSL ENGINE 介接 HSM 或智慧卡的系統，以及會複製、搬移、刪除檔案的特權腳本，都可能在升級後出問題。
tags:
  - Security
  - Ubuntu
  - Rust
---

## ikusupuroa 觀點

### 1. 26.10 不是要你上正式環境，而是讓你提早看到 28.04 LTS

26.10 支援到 2027 年 7 月，是過渡版本。原文明確說，這一版是為 28.04 LTS 定方向。對台灣企業來說，最有價值的做法是在測試環境導入 26.10，把下面三類相容性問題提早找出來，避免 2028 年升級 LTS 時才發現。

### 2. 第一個要盤點：/boot 的磁碟配置

在 Secure Boot 開啟時，26.10 的簽章版 GRUB **不再支援 /boot 放在 LVM、LUKS 加密，或 RAID1 以外的軟體 RAID 上**，Btrfs、XFS、ZFS 等檔案系統驅動也移除了。

台灣企業的伺服器標準映像檔（golden image）或自動化部署範本，常常為了管理方便把 /boot 也放進 LVM。建議 IT 團隊現在就檢查範本的 /boot 配置。原文也提供了退路：依賴這些功能的系統可以留在 26.04 LTS，搭配 Ubuntu Pro 與 Legacy add-on 可支援到 2041 年 5 月。

### 3. 第二個要盤點：靠 OpenSSL ENGINE 介接硬體的系統

OpenSSL 4.0 **移除了 ENGINE 介面**，改用 provider 機制。原文特別點名：用 ENGINE 介接 HSM（硬體安全模組）、PKCS#11 智慧卡或 TPM 金鑰的系統，要現在開始找對應的 provider 並測試遷移。

以下是本站補充：台灣金融業的 HSM、政府與企業的智慧卡應用，屬於這類介接的高風險族群。實際影響取決於各系統用的是 ENGINE 還是其他介接方式，**待各廠商確認**，建議直接向 HSM 或中介軟體廠商詢問 OpenSSL 4.0 provider 的支援時程。

### 4. 第三個要盤點：會動到檔案的特權腳本

26.04 LTS 已經預設使用 Rust 版 coreutils，但保留了 GNU 版的 `cp`、`mv`、`rm`；26.10 把這三個也換掉了。原文建議特別測試「需要特權、會複製、搬移或刪除檔案」的流程，例如備份、Log 輪替、部署腳本。

### 5. 對 IT 管理有利的更新

- **Microsoft 帳號登入加 MFA**：authd 支援用 Microsoft 密碼登入並以 Microsoft Authenticator 完成多因素驗證，也能停用這類帳號的本機密碼登入。對大量使用 Microsoft 365 的台灣企業，Ubuntu 筆電可以納入同一套身分治理。
- **硬體金鑰 VPN**：NetworkManager 支援 PKCS#11 與智慧卡，可用 YubiKey 等硬體金鑰連 VPN。原文提到這能讓企業「不必向稽核人員解釋例外」，對有資安稽核需求的單位很實用。
- **後量子密碼**：OpenSSL 預設優先使用混合式後量子金鑰交換（對方支援時），延續 26.04 LTS 的基礎。

## 原文精華導讀

### 背景

原文指出，AI 工具正在加快漏洞被發現的速度。修補要更快，但作業系統本身也要能在修補出來之前，限制攻擊者能造成的傷害。26.10 的做法是**減少暴露在攻擊下的程式碼**：用記憶體安全的實作取代舊實作，同時維持既有的隔離（confinement）機制。

### 更新重點

| 面向 | 更新內容 | 升級前要注意 |
| --- | --- | --- |
| Secure Boot | 簽章版 GRUB 只保留開機必要功能：/boot 支援 ext4、FAT、ISO9660 與 squashfs | /boot 在 LVM、LUKS、RAID1 以外的軟體 RAID 上不再支援（只影響開機路徑） |
| 全磁碟加密 | TPM 全磁碟加密擴及沒有硬體信任根的機器，安裝時需設定 PIN 或密碼 | 移除 PIN 後就無法防範韌體竄改 |
| 核心工具 | `cp`、`mv`、`rm` 也改用 Rust，核心工具全面 Rust 化 | 測試依賴細微指令行為的腳本 |
| 加密函式庫 | OpenSSL 4.0、OpenSSH 10.5；新增 upki 憑證撤銷檢查 | ENGINE 介面、SSLv3 移除；舊式橢圓曲線停用 |
| 訊息匯流排 | dbus-broker 取代使用了 20 多年的 dbus-daemon | AppArmor 的管控維持不變 |
| 時間同步 | 記憶體安全的 ntpd-rs 可供測試，目標在 27.04 成為預設 | — |
| 身分驗證 | authd 支援 Microsoft 密碼加 MFA；NetworkManager 支援硬體金鑰 VPN | — |
| 語音輸入 | Myna 在沙箱化的推論 snap 中本機辨識，音訊不上傳 | 辨識後的文字仍依所輸入的應用程式處理 |
| 核心 | Linux 7.3，更新 Landlock、AppArmor、SELinux 等安全模組 | — |

### OpenSSL 4.0 與憑證撤銷

- **後量子密碼**：提供 ML-KEM、ML-DSA、SLH-DSA；對方支援時，TLS 預設優先使用混合式後量子金鑰交換。
- **Encrypted Client Hello（ECH）**：可以保護 TLS 交握中要連線的網站名稱，但要應用程式與伺服器都支援並啟用，也不會隱藏目的 IP 位址。
- **upki**：讓 Linux 指令列工具也能檢查憑證是否已被撤銷，使用本機快取的 CRLite 資料，不必每次連線都去問 CA。26.10 已整合進 curl。
- **移除或限制的舊功能**：ENGINE 介面改用 provider；移除 SSLv3；停用舊式橢圓曲線與明確曲線參數；收緊憑證與撤銷檢查。

### OpenSSH 10.5

延續預設的混合式後量子金鑰交換，並包含 OpenSSH 10.3 的修正：

- `authorized_keys` 的 `principals=` 選項中，空的憑證 principals 清單不再被當成萬用字元。
- sshd 正確限制可接受的 ECDSA 演算法。
- 提早驗證指令列上的使用者名稱，避免透過 `ssh_config` 的設定代號展開 shell 特殊字元。

### 支援期限

Ubuntu 26.10 支援到 **2027 年 7 月**。原文鼓勵使用者拿自己的工作負載測試並回饋，結果會影響 28.04 LTS。

延伸閱讀：本站的 [Ubuntu 26.10 Stonking Stingray 發布導讀](../ubuntu-26-10-stonking-stingray/)。

### 出處

- 原文：[What’s new in security for Ubuntu 26.10?](https://ubuntu.com/blog/ubuntu-26-10-security)（Ubuntu Blog，Ijlal Loutfi，2026-10-06）
- 官方說明：[Streamlining Secure Boot for 26.10](https://discourse.ubuntu.com/t/streamlining-secure-boot-for-26-10/79069)、[Ubuntu 26.10 is switching to dbus-broker](https://discourse.ubuntu.com/t/ubuntu-26-10-is-switching-to-dbus-broker/84060)、[An update on rust-coreutils](https://discourse.ubuntu.com/t/an-update-on-rust-coreutils/80773)
