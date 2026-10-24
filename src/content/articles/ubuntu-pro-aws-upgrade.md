---
title: AWS 上升級 Ubuntu Pro 有新選項：改走 Marketplace 授權，可議價、可折抵 EDP 承諾
pubDate: 2026-10-24
canonicalTitle: A new way to upgrade to Ubuntu Pro on AWS
canonicalUrl: https://canonical.com/blog/upgrade-ubuntu-lts-instances-to-ubuntu-pro-in-aws
canonicalAuthor: Carlos Bravo
canonicalPubDate: 2026-10-23T16:17:44Z
sourceFeed: Canonical Blog
summary: 透過 AWS License Manager 把既有的 Ubuntu LTS 執行個體原地升級為 Ubuntu Pro，現在可以選擇 AWS Marketplace 的 Ubuntu Pro 授權作為目的地，不再只能用傳統的 EC2 授權。操作流程幾乎不變，但採購方式改為 Marketplace 交易，可以取得私有報價、量販折扣、搭配企業支援，並計入 AWS EDP 承諾消費。
taiwanTakeaway: 這次的改變不在技術，而在採購：對已經和 AWS 簽了 EDP 承諾消費的台灣中大型企業，Ubuntu Pro 的費用可以直接折抵承諾額度，還能和 Canonical 議價、綁企業支援。財務與採購部門會比 IT 更在意這個消息；但要注意，轉換時主機必須停機重開，要排維護時段。
tags:
  - Cloud
  - AWS
  - Ubuntu Pro
  - Security
---

## 🇹🇼 台灣觀點點評

### 1. 誰最受惠：有 AWS EDP 承諾的企業

台灣的金融、電商、遊戲與製造業中，不少中大型企業和 AWS 簽有 **EDP（Enterprise Discount Program，企業折扣方案）**，承諾一定期間內的消費額度來換取折扣。

過去用 License Manager 原地升級 Ubuntu Pro，走的是一般的 EC2 隨用隨付計費。現在改用 Marketplace 授權後：

- **費用可以計入 EDP 承諾額度**：原本就要花掉的承諾額度，可以拿來支付 Ubuntu Pro。
- **可以向 Canonical 議價**：大規模部署可以談私有報價（private offer）與量販折扣。
- **企業支援可以一起買**：24/5 或 24/7 的企業支援直接綁進訂閱。
- **直接和 Canonical 打交道**：支援窗口不必透過 AWS 轉介。

對 IT 團隊來說流程幾乎一樣；真正會在意這個消息的是**財務與採購**。建議 IT 主管把這篇轉給負責雲端合約的同事。

### 2. 要先知道的代價：需要停機

新流程的前置步驟是**先停止要轉換的執行個體**，整個過程通常最多 15 分鐘，轉換後要重新啟動，Ubuntu Pro 會在下次開機時自動啟用。

所以這不是可以白天直接做的操作。對 24 小時服務的系統，要排維護時段，或在有負載平衡的架構下逐台輪替轉換。

### 3. 什麼時候該選哪一種

| 情況 | 建議做法 |
| --- | --- |
| 新建主機 | 直接用預先啟用的 Ubuntu Pro AMI（原文建議的首選） |
| 既有主機、量不大、沒有 EDP | 原地升級，傳統 EC2 授權即可 |
| 既有主機、量大或有 EDP 承諾 | 原地升級，選 **Marketplace 授權**，再和 Canonical 談報價 |

> 以上是本站依原文整理的選擇建議。實際價格與折扣條件，原文沒有提供，需要向 Canonical 或 AWS 業務窗口確認。

### 4. 為什麼台灣企業現在該考慮 Ubuntu Pro

本站近期的三篇安全公告導讀（[php2shell](../php2shell-php-critical-vulnerability/)、[eMudhra](../emudhra-ca-compromise/)、[curl](../curl-vulnerabilities-oct-2026/)）都出現同樣的狀況：**20.04 LTS 以前的版本，修補只透過 Ubuntu Pro 提供。** 手上還有舊版主機、又暫時無法升級作業系統的企業，Ubuntu Pro 是最直接的止血方式。

## 原文精華導讀

### 發生了什麼

Canonical 宣布，透過 AWS License Manager 把既有 Ubuntu LTS 執行個體升級成 Ubuntu Pro 時，可以選擇 **AWS Marketplace 的 Ubuntu Pro 授權**作為目的地，取代傳統的 EC2 授權。原文的說法是：「同樣順暢的體驗，更有彈性的採購方式。」

### 背景：原地升級的由來

Canonical 通常建議直接用預先啟用的 Ubuntu Pro AMI 建立新主機。但很多企業無法輕易重新部署，所以三年多前推出了透過 AWS License Manager 原地升級的方式，省下重新部署的時間。

過去原地升級使用標準 EC2 授權。想要私有報價、承諾消費協議或搭配支援的企業，必須部署到另一個新的 SKU。新的 Marketplace 目的地解決了這個問題。

### 運作方式

技術上幾乎沒有改變：同樣在 AWS License Manager 中執行 License Type Conversion，唯一的差別是選擇的目的地授權類型。執行個體會收到更新後的中繼資料，Ubuntu Pro 在下次開機時自動啟用安全與合規服務。

改變在商業面：採購從 EC2 的隨用隨付計費，變成依企業需求量身安排的 AWS Marketplace 交易。

### Marketplace 授權的好處

- **私有報價與量販價格**：大規模部署可直接與 Canonical 協商客製價格與分級折扣。
- **客製化支援方案**：把 24/5 或 24/7 企業支援直接納入訂閱費用。
- **計入 AWS EDP**：購買金額直接計入 AWS Enterprise Discount Program 的承諾消費。
- **與 Canonical 直接往來**：支援服務可以直接找 Canonical，不必透過 AWS。

### 前置條件

- 執行個體已啟用 **AWS Systems Manager（SSM）**，可以在 SSM 主控台的 Fleet Manager 中看到。
- 可以停止並重新啟動執行個體，整個流程通常最多 15 分鐘。
- 網路設定符合 [Ubuntu Pro Client 的網路需求](https://canonical-ubuntu-pro-client.readthedocs-hosted.com/en/latest/references/network_requirements.html)。

### 轉換步驟

1. **停止執行個體**：在 EC2 Dashboard 關閉所有要轉換的執行個體。
2. **轉換授權類型**：
   1. 開啟 AWS License Manager，在左側選單選擇 **License type conversion**。
   2. 點選 **Create license type conversion**。
   3. 選擇 **Ubuntu LTS**，並勾選要升級的執行個體。
   4. 點選 Next，目的地授權類型選擇 **Ubuntu Pro License Manager Upgrade (x86/Arm)**。請選擇 **Marketplace**，而不是標準的 EC2 中繼資料授權，才能使用企業報價與私有報價。
   5. 確認設定後點選 **Convert**。轉換約需幾分鐘，可在 License Manager 主控台查看進度。
3. **確認升級結果**：重新啟動執行個體，透過 SSH 或 SSM 登入後執行：

```bash
pro status
```

輸出會顯示執行個體正在執行 Ubuntu Pro，且服務已啟用。

### 出處

- 原文：[A new way to upgrade to Ubuntu Pro on AWS](https://canonical.com/blog/upgrade-ubuntu-lts-instances-to-ubuntu-pro-in-aws)（Canonical Blog，Carlos Bravo，2026-10-23）
- Canonical 文件：[In-place Ubuntu LTS to Pro upgrade](https://ubuntu.com/aws/docs/aws-how-to/instances/upgrade-in-place-from-lts-to-pro/#upgrade-in-place-from-lts-to-pro)
- AWS 文件：[Switching license types in AWS Marketplace](https://docs.aws.amazon.com/marketplace/latest/buyerguide/switching-licenses.html)
- 原始操作說明（傳統 EC2 授權）：[Upgrade your existing Ubuntu LTS instances to Ubuntu Pro in AWS](https://ubuntu.com/blog/upgrade-your-existing-ubuntu-lts-instances-to-ubuntu-pro-in-aws)
