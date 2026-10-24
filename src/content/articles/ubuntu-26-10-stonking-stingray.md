---
title: Ubuntu 26.10 Stonking Stingray 登場：Rust coreutils 全面上線、本機 AI 語音輸入 Myna 首發
pubDate: 2026-10-23
canonicalTitle: Canonical releases Ubuntu 26.10 Stonking Stingray
canonicalUrl: https://ubuntu.com/blog/canonical-releases-ubuntu-26-10-stonking-stingray
canonicalAuthor: Canonical
canonicalPubDate: 2026-10-15T12:16:02Z
sourceFeed: Ubuntu Blog
summary: Ubuntu 26.10「Stonking Stingray」完成 Rust 版 uutils coreutils 的全面替換，並以 Sequoia PGP 帶來後量子（post-quantum）就緒的套件簽章。這一版也首度整合 Myna，一個在本機執行、不上傳語音的 speech-to-text 代理，作為 Ubuntu AI 路線圖的第一個里程碑。
taiwanTakeaway: 26.10 是一個「現在就該開始測、但先別上正式環境」的版本：Rust coreutils 會直接考驗你們 CI 裡那堆 shell script，而 Myna 的本機語音辨識，則讓重視個資與機敏資料的台灣企業，第一次有機會在不把聲音送上雲的前提下評估 AI 輸入。
tags:
  - Ubuntu
  - AI
  - Rust
  - Security
---

## 🇹🇼 台灣觀點點評

### 1. 先定位：26.10 是 interim 版本，不是 LTS

26.10 屬於 interim release（過渡版本），支援期約 9 個月。對台灣企業的建議很直接：

- **正式環境**：繼續以 26.04 LTS（或 24.04 LTS）為主。
- **開發與 CI 環境**：現在就導入 26.10 做相容性測試。這一版的變化，大多會在 28.04 LTS 成為預設，越早測、越早知道哪裡會壞。

### 2. Rust coreutils：最該先測的是你的 shell script

`ls`、`cp`、`date`、`sort` 這些每天都在用的指令，在 26.10 已經全面換成 Rust 實作的 **uutils coreutils**。好處是記憶體安全（memory safety），長期能減少一整類資安漏洞；風險則是**少數邊角行為或參數可能與 GNU coreutils 不同**。

台灣很多企業的部署腳本、備份排程、Log 處理流程，都是多年累積的 Bash script。建議：

1. 在 CI 加一條 26.10 的 runner，把既有腳本跑一輪回歸測試。
2. 特別留意依賴特定輸出格式（例如 `date`、`ls` 輸出被拿去 `awk` 解析）的腳本。
3. 發現差異時，回報給 uutils 上游，也同步修正腳本，讓 28.04 LTS 升級時少踩坑。

### 3. Myna：本機語音輸入，對台灣的意義在「資料不出機器」

Myna 的關鍵不是「又一個語音輸入工具」，而是**語音辨識完全在本機執行**，模型下載後不需連網，音訊不上傳也不儲存。對下列台灣場景特別有吸引力：

- **醫療、金融、法務**：口述病歷、客服紀錄、會議逐字稿，最怕的就是語音資料外流，本機處理能大幅降低《個人資料保護法》上的疑慮。
- **無障礙需求**：Canonical 把 Myna 定位為以無障礙（accessibility）為優先的 AI 整合，對有輸入困難的使用者是實質幫助。
- **開發者工作流程**：原文描繪的未來方向是「用說的描述意圖」，例如請系統協助調查測試失敗的原因。不過目前 Myna 明確只做**聽寫（dictation）**，不是語音助理。

> **待確認**：Myna 支援 Parakeet、Whisper、FunASR 等引擎，其中 Whisper 與 FunASR 都有中文能力，但**台灣華語口音、中英夾雜、台語的實際辨識品質，原文沒有說明**，需要實測。這正是台灣社群可以回饋給 Canonical 的地方。

### 4. 企業採購關鍵字：Entra ID 與後量子密碼

- **Microsoft Entra ID 整合強化**：台灣大量企業使用 Microsoft 365，Ubuntu Desktop 能以 MFA 或無密碼方式登入，代表 Linux 工作站可以納入與 Windows 相同的身分治理。這是 IT 部門評估「開發者用 Ubuntu 筆電」時最常卡關的一項。
- **後量子就緒的套件簽章**：以 Sequoia PGP 取代 GnuPG 驗證 APT 套件庫簽章，並透過 openCryptoki 支援 ML-DSA、ML-KEM。對正在規劃後量子密碼（PQC）遷移的金融與政府單位，這是可以寫進技術評估報告的具體進度。

### 5. 硬體生態：對台灣 ODM 與 IC 設計業的訊號

Linux kernel 7.3 支援 Intel Xe3P（Nova Lake）、AMD Zen 6 等新平台，新增 amd64v3 專屬安裝程式，並推出 **RISC-V 桌面映像檔**，支援首款 RVA23 硬體 SpacemiT K3。台灣在伺服器 ODM、主機板與 RISC-V IP（例如晶心科技）都有產業位置，主流發行版對 RVA23 的完整桌面支援，意味著 RISC-V 開發板與產品驗證的軟體門檻又再降低。

## 原文精華導讀

### 版本定位

Ubuntu 26.10「Stonking Stingray」於 2026 年 10 月 15 日發布。Canonical 將這一版定調為：在既有基礎上強化企業安全、完成 Rust coreutils 遷移、強化 Microsoft Entra ID 整合，並導入後量子套件簽章，同時交付 Ubuntu AI 路線圖的第一個里程碑。

> 「Stonking Stingray is symbolic of Ubuntu's journey to not just build up, but also build out.」
> — Jon Seager, VP of Ubuntu Engineering, Canonical

### 重點一覽

| 面向 | 重點更新 |
| --- | --- |
| AI 與無障礙 | Myna speech-to-text 代理首發（選用功能），使用本機模型 |
| 桌面體驗 | GNOME 51、App Center 統一管理 snap 與 deb、Flutter 應用的螢幕閱讀器支援改善 |
| 系統穩定性 | 預設改用 dbus-broker；調整桌面 OOM（記憶體不足保護）評分 |
| 身分與安全 | Entra ID 整合（MFA、無密碼）；TPM 全磁碟加密擴及無硬體信任根的機種，可要求 PIN 或密碼 |
| 供應鏈安全 | Sequoia PGP 取代 GnuPG 驗證 APT 簽章；openCryptoki 支援 PKCS #11 V3.2、ML-DSA、ML-KEM |
| 核心與硬體 | Linux kernel 7.3；支援 Intel Xe3P、AMD Zen 6、NVIDIA 615；內建 Lustre 平行檔案系統支援 |
| 架構 | amd64v3 專屬安裝程式；RISC-V 桌面映像檔，支援 RVA23 的 SpacemiT K3 |
| AI 運算 | ROCm 升級至 10.0，支援 vLLM 與 SGLang 等推論框架 |
| 開發工具鏈 | LLVM 22.1.6、GCC 15.2.0、Python 3.14.7、Rust 1.97.1、Zig 0.16、Go 1.27 |

### Rust coreutils 全面上線

26.10 完成以 Rust 撰寫的 [uutils coreutils](https://github.com/uutils/coreutils) 替換作業。這是 Canonical 近年將記憶體安全語言導入系統核心工具的延續，與同一版的 Sequoia PGP（同樣以 Rust 撰寫）一起構成這一版的安全主軸。Rust 開發者另可使用同期推出的 **devpack for Rust**，快速建立含版本管理與 IDE 支援的開發環境。

### Myna：Ubuntu 的語音輸入代理

- **名稱由來**：取自擅長模仿人聲的八哥鳥（Myna）。
- **定位**：26.10 中為選用（opt-in）功能，說話時提供清楚的視覺回饋；預計在 28.04 LTS 時成為預設內建。
- **隱私**：辨識完全在本機執行，模型下載後不需網路，音訊不上傳也不儲存。
- **引擎**：支援 Parakeet、Whisper、FunASR；有支援的 NVIDIA GPU 時可使用 GPU 加速引擎。
- **範圍**：目前專注於聽寫，不提供語音控制桌面。

技術預覽版可在 Ubuntu 24.04 LTS、26.04 LTS 與 26.10（amd64 / amd64v3、GNOME on Wayland）上安裝：

```bash
sudo add-apt-repository ppa:canonical-desktop-team/myna
sudo apt install myna-config
```

安裝後從 Activities 開啟 **Myna settings** 完成設定，即可在任何文字欄位按下快捷鍵開始說話。Myna 在 [github.com/canonical/myna](https://github.com/canonical/myna) 開放開發，歡迎回報問題與意見。

### 出處

- 原文：[Canonical releases Ubuntu 26.10 Stonking Stingray](https://ubuntu.com/blog/canonical-releases-ubuntu-26-10-stonking-stingray)（Ubuntu Blog，2026-10-15）
- 延伸閱讀：[Myna speech-to-text is now available as a technology preview](https://ubuntu.com/blog/myna-speech-to-text-technology-preview-available)（Ubuntu Blog，Jean-Baptiste Lallement，2026-10-12）
