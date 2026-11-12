---
title: 虛擬資料室改用 Android？用 Anbox Cloud 串流畫面，機密文件不落地
pubDate: 2026-11-12
canonicalTitle: What if your Virtual Data Room (VDR) was Android™ based?
canonicalUrl: https://ubuntu.com/blog/what-if-your-virtual-data-room-vdr-was-android-based
canonicalAuthor: Bertrand Boisseau
canonicalPubDate: 2026-11-11T08:00:00Z
sourceFeed: Ubuntu Blog
summary: 併購的盡職調查要讓律師、財務顧問、潛在買家看到高度機密的文件，但不能讓檔案留在他們的裝置上。Canonical 提出的做法是把文件檢視 App 放在雲端的 Android 容器裡執行，用 Anbox Cloud 只把畫面串流到使用者的瀏覽器；原始檔案不會傳到裝置上，但截圖、錄影和翻拍仍然擋不住。
takeaway: 這篇的重點不是 Android 比較適合看文件，而是「檢視文件的程式需不需要在使用者的裝置上執行」。把 App 放在雲端、只送畫面，檔案就不會到使用者手上；但原文也承認，截圖和翻拍還是擋不住，浮水印與權限控管仍然要做。
tags:
  - Android
  - Cloud
  - Security
---

## ikusupuroa 觀點

### 1. 先懂幾個名詞

- **VDR**（Virtual Data Room，虛擬資料室）：在併購等交易中，讓外部人員在受控環境裡查看機密文件的線上平台。
- **盡職調查**（due diligence）：交易前，買方與顧問查核對方財務、法律等資料的過程。
- **Anbox Cloud**：Canonical 的產品，在雲端以容器執行 Android，並把 App 畫面串流到使用者的瀏覽器。本站之前的〈[Android 開發成本不只是買手機](../android-dev-cost-anbox-cloud/)〉介紹過它用在測試環境的情境。
- **BYOD**（Bring Your Own Device，自帶裝置）：員工或外部人員用自己的手機、電腦存取公司資料。

### 2. 值得注意的地方：搬動的是程式，不是文件

原文的出發點是，盡職調查的參與者來自不同組織，用的裝置、作業系統和 IT 規則都不同，很難逐一管控每台裝置。多數 VDR 已經會禁止下載或轉寄原始檔，但原文追問的是：處理機密文件的程式，應該在哪裡執行？

讀完後我覺得這個問題問得好。用瀏覽器看文件時，依照系統的做法，文件內容可能還是會在使用者的裝置上處理；裝專用 App 則要面對安裝、維護與各作業系統的支援成本。原文的做法是讓檢視 App 整個在雲端執行，使用者的瀏覽器只收到畫面像素（pixels），就像看影片串流，原始檔案不會傳到裝置上。

### 3. 原文也講清楚了限制

我覺得這篇比較中肯的地方，是它沒有說串流就萬無一失。原文明確寫出：有心人還是可以截圖、錄影，或用另一台相機翻拍，所以仍然建議搭配 VDR 的身分驗證、文件權限與浮水印（watermarking）。

另外，原文也承認，如果只是要顯示 PDF，一般的網頁檢視器可能就夠了。改用 Android 的好處，主要是給**已經有 Android 文件 App** 的 VDR 業者：不用為桌機重寫一套程式，直接透過瀏覽器串流給使用者，使用者也不需要有 Android 手機。

### 4. 還有哪些疑問

> **待確認**：原文沒有提到串流對網路頻寬與延遲的要求，例如跨國參與者連線時的使用體驗。

> **待確認**：浮水印要由 VDR 業者自己的 App 做，還是 Anbox Cloud 有提供相關功能，原文沒有說明。

## 原文精華導讀

### 問題：機密文件要給外部人看，又不能讓檔案外流

- 併購的盡職調查中，律師、財務顧問與潛在買家都需要看高度機密的文件，而且這些人來自不同組織。
- 每個人用的裝置、作業系統、IT 規則都不一樣，存取必須嚴格控管、監控，必要時還要能撤銷。
- 現有的 VDR 靠存取限制與安全檢視來處理，多數已經禁止下載或寄出原始檔。

### 做法：把 App 搬到雲端，只串流畫面

原文比較了三種檢視方式：

| 方式 | 原文的說明 |
| --- | --- |
| 瀏覽器檢視 | 方便、不用裝 App、跨裝置；但依系統的做法，文件內容可能在本機處理 |
| 本機安裝的專用 App | 要付出安裝、維護與各作業系統支援的成本 |
| 雲端執行 App、串流畫面 | 有瀏覽器的便利，又把執行集中在雲端，文件不必在使用者裝置上處理 |

用 Anbox Cloud 時的流程：

1. VDR 業者把自己的 Android 文件檢視 App 放在隔離的容器執行個體（instance）裡執行。
2. 使用者登入 VDR 平台、打開有權限的文件，透過任何瀏覽器操作遠端的 App，不會收到原始檔案。
3. 工作階段結束後可以停止這個 Android 執行個體，清掉暫存資料。

原文認為，這樣做改變的是架構，不是使用者體驗；VDR 業者也能完整掌握資訊的處理與儲存。

### 為什麼用 Android

- 如果只是顯示 PDF，一般的網頁檢視器可能就夠了。
- 價值在於 VDR 業者已經有 Android App，裡面有自己的文件處理邏輯、整合與工作流程；用 Anbox Cloud 可以直接串流，不必為桌機重新開發。
- Anbox Cloud 提供執行隔離的 Android 執行個體、管理 App 生命週期與串流的基礎設施；容器化的執行模式方便同時管理多個獨立的工作階段。
- 可以部署在公有雲或私有基礎設施，彈性決定 App 與資料在哪裡處理。
- 同樣的模式也適用於 BYOD 資安：把敏感資料留在使用者裝置之外。

### 資安是共同責任

- 串流只把圖形資料送到裝置，伺服器不會送出文件的任何部分，只送目前畫面的像素，讓擷取資料變得困難得多。
- 但這不代表拿不到資訊：使用者還是可以截圖、錄影或用外接相機翻拍，所以仍然建議搭配 VDR 的身分驗證、文件權限與浮水印。

### 結論

原文的結論是：問題不在 Android 是不是比較好的文件檢視器，而在檢視文件的 App 到底需不需要在使用者的裝置上執行。對已經在用 Android App 的 VDR 業者，雲端執行提供了另一種跨裝置擴大存取的方式，不用維護多套用戶端，也不用把文件發到本機處理。

### 出處

- 原文：[What if your Virtual Data Room (VDR) was Android™ based?](https://ubuntu.com/blog/what-if-your-virtual-data-room-vdr-was-android-based)（Bertrand Boisseau，Ubuntu Blog，2026 年 11 月 11 日）
- 原文提到的延伸閱讀：[Rethinking BYOD security: protecting data without trusting devices](https://ubuntu.com/blog/rethinking-byod-security-protecting-data-without-trusting-devices)（Ubuntu Blog，2026 年 5 月 13 日）
