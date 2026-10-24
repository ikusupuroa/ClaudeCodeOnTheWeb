---
title: 不用重建主機也能升級：在 AWS 上把 Ubuntu LTS 原地轉成 Ubuntu Pro
pubDate: 2026-10-24
canonicalTitle: A new way to upgrade to Ubuntu Pro on AWS
canonicalUrl: https://canonical.com/blog/upgrade-your-existing-ubuntu-lts-instances-to-ubuntu-pro-in-aws
canonicalAuthor: Carlos Bravo
canonicalPubDate: 2023-04-28
sourceFeed: Canonical Blog
summary: AWS License Manager 支援把正在運行的 Ubuntu LTS EC2 執行個體，直接在主控台轉換為 Ubuntu Pro，不必重新部署。轉換後即可取得 Expanded Security Maintenance（延伸安全維護）、universe 套件修補與 Livepatch 等能力，費用依 Ubuntu Pro 費率按秒計費。
taiwanTakeaway: 對還有一批 18.04、20.04 老系統跑在 AWS 上的台灣企業，這是「先止血、再規劃升級」最省事的路：不用動架構、不用停機重建，就能把資安修補延長，還能把授權費變成可預測的營運支出。
tags:
  - Cloud
  - AWS
  - Ubuntu Pro
  - Security
---

## 🇹🇼 台灣觀點點評

### 1. 真正的痛點：老系統「不敢升、不能升」

在台灣，跑在 AWS 上的 Ubuntu 主機有相當比例是幾年前一次性上雲的系統：製造業的 MES 介接服務、零售業的會員與 POS 後台、金融周邊的批次作業主機。這些系統的共同點是**能動就不要動**，作業系統大版本升級往往牽動應用程式相容性、驗證與停機窗口。

Ubuntu 20.04 LTS 的標準支援已經結束，18.04 更早。對這類主機來說，原地轉成 Ubuntu Pro 的價值不在新功能，而在於**用最低的變更風險，把安全修補的時間線拉長**，替真正的升級專案爭取規劃時間。

### 2. 成本：從「一次買斷」變成「用多少付多少」

- **按秒計費、併入 AWS 帳單**：不需要另外走一套 Canonical 採購流程，對已經用 AWS 帳單統一管理雲端費用的台灣企業，財務與採購流程最單純。
- **可搭配 Savings Plan**（依原文與 AWS 公告）：已有承諾用量的企業，可以把 Pro 費率納入既有的成本最佳化策略。
- **先挑重點主機**：不必整個環境一次轉換。建議先從對外服務、處理個資或支付資料的主機開始，其餘維持一般 LTS。

> 實際單價請以 AWS Marketplace 與 AWS 帳單顯示為準，本站不提供價格數字。

### 3. 法規與稽核：讓「有在修補」變得可證明

不論是《資通安全管理法》對公務機關與特定非公務機關的要求，或金管會對金融業雲端委外的資安期待，稽核時常被問到「作業系統是否仍在原廠支援期內、是否持續修補已知弱點」。Ubuntu Pro 提供的延伸安全維護與 universe 套件修補，能讓這個問題有明確答案。

### 4. 建議的導入順序

1. **盤點**：列出仍在 18.04 / 20.04 的 EC2 執行個體與其業務重要性。
2. **前置檢查**：確認主機已被 AWS Systems Manager 納管（SSM Agent 與 IAM Role 正常）。
3. **小批試轉**：先轉換測試環境，確認 `pro status` 狀態與既有監控、備份流程不受影響。
4. **分批轉換**：依重要性分批進行，並同步啟動中長期的 LTS 版本升級規劃（例如 24.04 或 26.04 LTS）。

> **待確認**：AWS 亞太（台北）區域是否已支援此 License Manager 轉換功能，建議導入前在主控台或向 AWS 確認。

## 原文精華導讀

### 這篇原文在講什麼

AWS 在 2023 年 4 月推出新功能，讓使用者可以透過 **AWS License Manager** 把既有的 Ubuntu LTS EC2 執行個體，**直接在主控台升級為 Ubuntu Pro**，不需要重新部署主機。Canonical 在這篇文章中說明了操作方式與前置條件。

### Ubuntu Pro 多了什麼

| 項目 | Ubuntu LTS（一般） | Ubuntu Pro |
| --- | --- | --- |
| main 套件安全修補 | 標準支援期內 | 標準支援期後延伸，最長可達 15 年（含 Legacy add-on） |
| universe 套件修補 | 社群盡力而為 | 納入 Canonical 安全修補範圍 |
| Livepatch（核心熱修補） | — | 有，可減少因核心修補而重開機 |
| Landscape（大規模主機管理） | — | 可使用 |

> 15 年支援與 Landscape 的描述，參考 Canonical 2026 年 10 月最新的安全公告說明；2023 年原文發布時的支援年限描述可能較短。

### 前置條件

- 執行個體為 **Ubuntu LTS 16.04 以上**版本。
- 執行個體必須被 **AWS Systems Manager（SSM）** 納管。
- Ubuntu Pro client 需更新到新版（套件名稱為 `ubuntu-pro-client`，較舊系統可能仍是 `ubuntu-advantage-tools`；確切指令請以官方文件為準）。

### 操作流程（AWS 主控台）

1. 進入 **AWS License Manager**。
2. 建立 **License type conversion**（授權類型轉換）。
3. 來源選擇 **Ubuntu LTS**，並勾選要轉換的執行個體。
4. 目的地選擇 **Ubuntu Pro**，執行轉換。
5. 轉換完成後，在主機上確認狀態：

```bash
sudo pro status
```

### 計費方式

轉換後的執行個體依 **Ubuntu Pro 的 On-Demand 費率按秒計費**，也可以搭配 Savings Plan。若需要年約形式，Canonical 也在 AWS Marketplace 提供年度訂閱選項。

### 其他取得 Ubuntu Pro 的方式

原文與 Canonical 文件提到，除了 License Manager 原地轉換，也可以：

- 直接從 AWS Marketplace 啟動 **Ubuntu Pro AMI**（適合新建主機）。
- 在既有主機上以 Canonical 的 Pro token 執行 `sudo pro attach`（適合跨雲或自建機房統一管理）。

### 出處

- 原文：[Upgrade your existing Ubuntu LTS instances to Ubuntu Pro in AWS](https://canonical.com/blog/upgrade-your-existing-ubuntu-lts-instances-to-ubuntu-pro-in-aws)（Canonical Blog，Carlos Bravo）
- AWS 公告：[AWS License Manager now supports upgrading of EC2 Instances from Ubuntu to Ubuntu Pro operating system](https://aws.amazon.com/about-aws/whats-new/2023/04/aws-license-manager-ec2-instances-ubuntu-pro-operating-system/)
