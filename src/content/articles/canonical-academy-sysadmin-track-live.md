---
title: Canonical Academy 的 SysAdmin 認證完整上線：四科考試、線上實機操作，通過全部拿到資格證書
pubDate: 2026-11-25
canonicalTitle: The full Canonical Academy SysAdmin track is now live
canonicalUrl: https://canonical.com/blog/canonical-academy-sysadmin-track-live
canonicalAuthor: Canonical
canonicalPubDate: 2026-11-24T17:51:24Z
sourceFeed: Canonical Blog
summary: Canonical Academy 的 SysAdmin 學習路線四科考試全部正式開放：Using Linux Terminal、Using Ubuntu Desktop、Using Ubuntu Server、Using DevOps Principles。考試在瀏覽器裡實機操作 Ubuntu 系統，每科 60 到 90 分鐘，順序自選；四科都通過可以拿到 SysAdmin 資格與可列印的證書，徽章與資格不會過期。
takeaway: 對想系統化學 Ubuntu 的人，這份認證把範圍列得很清楚：從指令列、桌面、伺服器到 DevOps，每一科都是日常維運會做的事，而且是在真的 Ubuntu 系統上動手做，不是只考選擇題。不過原文沒有列出報名費用與可用語言，要不要考之前先查清楚。
tags:
  - Ubuntu
  - DevOps
---

## ikusupuroa 觀點

### 1. 先懂幾個名詞

- **Canonical Academy**：Canonical（Ubuntu 的發行公司）推出的認證與考試平台，2025 年 10 月以 Using Linux Terminal 這一科開始。
- **SysAdmin track**：系統管理員學習路線，由四科考試組成，全部通過可以拿到 SysAdmin 資格。
- **performance-based task**（實機操作題）：在瀏覽器裡的實際 Ubuntu 系統上設定、修復或部署某些東西，由系統檢查最後的狀態來評分。
- **proctoring**（監考）：線上考試的監考方式，原文說這裡是 AI 輔助，加上真人把關。

### 2. 值得注意的地方：考的是「動手做」

原文最特別的是考試形式。每一科混合三種題型：

- **實機操作題**：在瀏覽器裡的實際 Ubuntu 系統上設定、修復或部署，占分數的大多數。
- **情境題**：先在系統上找到資訊，再回答問題。
- **選擇題**：考操作背後的知識。

評分檢查的是系統的最終狀態，所以同一題可以有不同做法，每個成功的步驟都算分。考試期間可以查 man page 和 Ubuntu 官方文件，原文的說法是「就像在工作時一樣」。

我是 Linux 學習者，覺得這個設計比較貼近學習的過程：重點是會不會把事情做完，不是背指令。

### 3. 四科各考什麼

原文把四科的內容整理得很具體，我歸納成下表（完整題目範圍要看官網的 exam content 頁面）：

| 科目 | 原文列出的內容 |
| --- | --- |
| Using Linux Terminal | 用正規表示式、管線、重新導向找出並編輯檔案；管理使用者、群組與檔案權限；設定 SSH 金鑰與密碼政策 |
| Using Ubuntu Desktop | 安裝與管理 Ubuntu 桌面；deb 與 snap 套件管理；LVM 磁碟區與快照；GRUB 開機流程；網路設定；Active Directory 整合；存取控制清單（ACL） |
| Using Ubuntu Server | 用 systemd 管理服務；用 NFS 或 Samba 分享檔案；部署含資料庫的網頁應用程式；設定 SSH 存取與防火牆；伺服器安全的最佳實務 |
| Using DevOps Principles | 用版本控制管理自動化腳本；用 cloud-init 與 Ansible 自動佈建；用 Landscape、Livepatch、Ubuntu Pro 做修補；設定容器與虛擬機；用 tcpdump、dig、ss 排除問題 |

這份清單可以當成學習地圖：從指令列開始，到桌面、伺服器，最後是大規模管理。這個由淺入深的順序是我的觀察，原文沒有這樣說。

### 4. 適合誰、怎麼考

原文說這個路線是為「早期職涯、實際接觸 Linux（特別是 Ubuntu）的人」設計的。已經在工作上管理 Ubuntu 的人，會覺得大部分任務很熟悉；剛接觸 Ubuntu 的人，原文建議先留時間練習再報考。

考試方式：

- 每科 60 到 90 分鐘，順序自選，可以從最接近日常工作的那科開始。
- 全程線上，不用去考場，也沒有先修課程。
- 每科考完得到一個數位徽章，標示涵蓋的 Ubuntu LTS 年份；四科都通過，得到 SysAdmin 資格與可列印的證書。徽章與資格都不會過期。

### 5. 還有哪些疑問

> **待確認**：原文沒有列出報名費用，只提到有限時折扣碼（詳見原文）。

> **待確認**：原文沒有說明考試提供哪些語言，也沒有說明台灣是否能報考。

> **待確認**：原文說徽章會標示 Ubuntu LTS 年份，但沒有說明新的 LTS 出來之後，舊年份的徽章與資格會怎麼處理。

## 原文精華導讀

### 重點

- Canonical Academy SysAdmin 路線的四科考試現在都正式開放（GA）。最後一科 Using DevOps Principles 剛離開 beta，所以考生現在可以完成整條路線，拿到 SysAdmin 資格。
- Canonical Academy 在 2025 年 10 月以 Using Linux Terminal 這一科推出，之後陸續加入另外三科，涵蓋 Ubuntu 的 Linux 系統管理，從指令列到自動化部署。

### 考試是怎麼設計的

- 每科都以系統管理員的日常工作為基礎，題目範圍可以在官網的 exam content 頁面查到。
- 每科由 Canonical 內部各領域專家參與設計，依據實際職務需求制定。原文另附〈How we create a Canonical Academy exam〉說明完整流程。

| 題型 | 原文的說明 |
| --- | --- |
| 實機操作題 | 考生在瀏覽器裡的實際 Ubuntu 系統上設定、修復或部署；占分數的大多數 |
| 情境題 | 要先在系統上找到資訊才能回答 |
| 選擇題 | 檢驗操作背後的知識與理解 |

- 評分檢查最終的系統狀態，所以做法不只一種；每個成功的步驟都算分。
- 考試中可以使用 man page 和 Ubuntu 官方文件。

### 考試的實際安排

- 每科 60 到 90 分鐘。
- 可以任意順序報考，從最接近日常工作的領域開始，之後再逐步加上其他科目。
- 全程線上，不用去考場，沒有先修課程。
- 監考為 AI 輔助，並有真人參與。

### 徽章與資格

- 每科考完得到一個數位徽章，可以分享到專業個人檔案，徽章會標示該科涵蓋的 Ubuntu LTS 年份。
- 四科都通過的人，得到 SysAdmin 資格與可列印的證書。
- 徽章與資格都不會過期。
- 為慶祝推出，原文提供了限時折扣碼，詳細的優惠內容與期限見原文。

### 出處

- 原文：[The full Canonical Academy SysAdmin track is now live](https://canonical.com/blog/canonical-academy-sysadmin-track-live)（Canonical，Canonical Blog，2026 年 11 月 24 日）
- 原文提到的延伸閱讀：[How we create a Canonical Academy exam](https://canonical.com/blog/how-we-create-a-canonical-academy-exam)（Canonical Blog）、[Canonical Academy 考試內容頁](https://canonical.com/academy/exam-content)
