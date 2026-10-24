---
title: 讓人物誌不再躺在簡報裡：Canonical 用 Git 與 AI Agent 維護「使用者原型」
pubDate: 2026-10-24
canonicalTitle: "From personas to archetypes: a living, shared understanding of the people we build for (Part 1 & 2)"
canonicalUrl: https://canonical.com/blog/from-personas-to-archetypes
canonicalAuthor: Peter B. Polgár
canonicalPubDate: 2026-10-23T22:25:12Z
sourceFeed: Canonical Blog
summary: Canonical 有 60 多項技術產品，各團隊的使用者人物誌（persona）常常做完就過時、無法共享。他們改用「原型」（archetype）：以行為為基礎、每個論點都附來源、用 Markdown 放在 Git 版本控制的使用者描述，再由 AI Agent 協助蒐集與起草、由人負責判斷與審核，讓原型像產品一樣持續更新。
takeaway: 對台灣做 B2B 軟體、SaaS 或系統整合的團隊，這套做法最值得借鏡的不是 AI，而是「每個論點都要有出處」：把客戶訪談、客服紀錄、業務回饋整理成有來源、有版本的使用者原型，產品、行銷、業務與 AI Agent 就能用同一份資料講同一種語言。
tags:
  - AI
  - Design
---

## ikusupuroa 觀點

### 1. 這不只是設計團隊的事

人物誌（persona）在台灣的軟體公司並不陌生，但常見的結局和原文描述的一樣：工作坊做完、放進簡報，半年後沒人記得，也沒人更新。

Canonical 的做法值得注意的地方在於，他們把使用者描述當成**一個需要維護的產品**，而不是一次性的專案。對台灣做 B2B 軟體、SaaS、系統整合的公司，這個問題特別明顯：

- **產品線多、客群差異大**：同時服務中小企業 IT 人員與大型企業的資訊長，各團隊對「使用者」的理解不一致。
- **第一線知識散落各處**：業務、售前、客服最了解客戶，但這些知識停留在個人筆記和對話紀錄裡，沒有回流到產品團隊。

### 2. 最值得借鏡的是「每個論點都有出處」

原文最核心的原則是：每個關於使用者的描述，都要能追溯到原始來源（訪談、客服紀錄、跨多次對話出現的模式）；推論出來的內容要明確標示，不能寫得像事實。

這對台灣團隊有兩個直接好處：

- **減少「我覺得客戶要的是……」的爭論**：意見不同時，回頭看來源就好。
- **AI 用得更安心**：原文明確指出，直接讓大型語言模型產生人物誌，只會得到聽起來合理、實際上缺乏證據的「平均值」。先整理好有來源的原型，再讓 AI Agent 讀取，才能讓 AI 的產出貼近真實客戶。

### 3. 可以從小規模開始

以下是本站補充的導入建議：不需要一開始就做到 Canonical 的規模。可以先挑一個最重要的客群，把現有的訪談與客服紀錄整理成一份附來源的 Markdown 文件，放進團隊的 Git 儲存庫，約定誰負責審核、多久更新一次。Canonical 也把他們的流程開源在 [GitHub](https://github.com/canonical/archetype-pipeline)，可以直接參考。

### 4. 原文自己點出的風險

原文很坦白地指出：把資料彙整交給 AI Agent，最大的風險不是事實錯誤，而是**團隊失去對使用者的直覺**。親自整理研究資料的過程，本身就是理解使用者的過程。他們的對策是嚴格的來源標註、變更紀錄，以及持續用實際應用（使用者研究、業務與行銷回饋）來驗證。這個提醒對所有想用 AI 加速研究工作的團隊都適用。

## 原文精華導讀

> 本篇整理自 Canonical 設計團隊的兩篇系列文章：[Part 1](https://canonical.com/blog/from-personas-to-archetypes)（2026-10-19）說明為什麼需要原型、原型是什麼；[Part 2](https://canonical.com/blog/from-personas-to-archetypes-part-2)（2026-10-23）說明如何建立與維護。

### Part 1：為什麼需要原型

**傳統人物誌的兩個問題：**

1. **很快過時**：團隊訪談後做出人物誌，當成專案結案，之後學到新東西也不更新，一年內就不準確，其他團隊發現錯誤後就不再信任。
2. **AI 生成的人物誌缺乏證據**：大型語言模型很容易產生一個「資安工程師」人物誌，聽起來合理卻沒有證據，還可能強化刻板印象。模型給的是訓練資料的平均值，描述不了 Canonical 真正的使用者。

Canonical 有 60 多項技術產品，使用者從自架家用伺服器的愛好者，到管理大量機器的技術長都有。他們需要一份**夠廣**（全公司對齊）又**夠深**（支援具體產品工作）的共同理解。

**原型（archetype）是什麼：**

- 以**行為**而非人口統計描述使用者類型，例如：他們如何評估新工具、什麼會破壞他們的信任、他們「糟糕的星期二」長什麼樣子。
- 每個行為描述都能追溯到來源，可以查證，而不是靠信任。
- 依顧客旅程的階段組織，例如 Day 0 評估、Day 1 部署、Day 2 維運，讓服務同一類使用者的多個團隊使用同一份檔案。
- 範圍同時涵蓋產品與品牌，和行銷常說的「品牌原型」不同。

**兩層架構：**

| 層級 | 範圍 | 負責人 |
| --- | --- | --- |
| 原型（archetype） | 跨所有產品的廣泛觀點 | User Science 團隊集中維護 |
| 情境人物誌（contextual persona） | 特定產品、功能或上市活動 | 使用它的團隊自己負責 |

情境人物誌一定從原型出發，繼承相同的證據；團隊學到的新東西再回饋到原型，不會卡在單一團隊。

**帶來的改變：** 原型成為結構化、機器可讀的檔案後，團隊可以讓 AI Agent 讀取經過驗證的原型，而不是直接對未調校的模型下指令；也能拿原型去指導行銷活動的目標設定，再看實際成效來驗證原型。

### Part 2：如何建立與維護

**五個步驟的建立流程**（AI Agent 負責蒐集與起草，人在每個關卡負責判斷與簽核）：

1. **蒐集**：訪談、內部專業知識與可信的二手資料，重點是行為而非人口統計。
2. **對應**：使用者想完成什麼工作、需要什麼、Canonical 的產品在哪裡發揮作用（Jobs-to-be-done）。
3. **綜整**：由 AI Agent 彙整證據、標註每一個來源、分群，並依設計好的範本起草；採紮根理論（grounded theory），從資料中歸納模式，避免既有偏見。
4. **策展與審查**：團隊成員審閱草稿、做判斷，再交給面對客戶的專家確認；所有變更寫進 changelog：改了什麼、為什麼、諮詢了誰。
5. **發布**：在儲存庫中發布有版本的規格檔與一頁摘要。

**可追溯性帶來信任：** 每個論點都附原始資料的來源，推論會特別標示。原型以 Markdown 放在 Git 儲存庫：設計師編輯、工程師可以 diff、AI Agent 可以讀取。

**持續更新的循環：** 各團隊在日常工作中有新發現時，提交到儲存庫；User Science 團隊審查、整合並更新原型，再發布回各團隊。

**更大的趨勢：** 原文認為，AI Agent 的表現取決於提供給它的脈絡與流程。有人維護、附來源的知識，加上明確的工作流程與人為監督，已經是讓 AI Agent 有效運作的必要條件，而不是加分項目。

### 出處

- Part 1：[From personas to archetypes (Part 1 of 2)](https://canonical.com/blog/from-personas-to-archetypes)（Canonical Blog，Peter B. Polgár，2026-10-19）
- Part 2：[From personas to archetypes (Part 2 of 2)](https://canonical.com/blog/from-personas-to-archetypes-part-2)（Canonical Blog，Peter B. Polgár，2026-10-23）
- 開源流程：[canonical/archetype-pipeline](https://github.com/canonical/archetype-pipeline)
