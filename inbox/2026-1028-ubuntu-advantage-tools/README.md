# UbuntuCVEs (CVE 漏洞掃描、分析與修復驗證模組)

## 1. 核心定位
本目錄專注於 Ubuntu 各發行版之 **CVE（Common Vulnerabilities and Exposures，通用弱點與漏洞）** 檢測、弱點分析報告產出、Ubuntu Pro / ESM 訂閱修補測試與自動化腳本工具鏈。

## 2. 目錄主要檔案與子模組
- `README.md`：目錄定位與結構說明文件。
- `01_UBUNTU_1404_PHP_CVE_TESTING.md`：**Ubuntu 14.04 PHP CVE 弱點驗證與 Ubuntu Advantage 修復測試指南**（涵蓋隔離測試沙盒建立、LTS 套件庫特性、UA 工具部署、PHP2Shell 雙漏洞驗證與 `--only-upgrade` 精準修補實務）。
- `02_PROFIX_TOOL_GUIDE.md`：**profix.sh 舊版 CVE 快速診斷工具完整使用指南**（涵蓋開發動機、先決條件與限制、指令語法、底層比對架構與繁體中文輸出範例）。
- `profix.sh`：**CVE 快速檢測與通報診斷 Shell 腳本**（專為缺乏原生 `pro fix` 的 Ubuntu 14.04 設計，直連官方 API 並自動比對本機 dpkg 套件版本與修復指引）。
- `Ubuntu CVE 掃描腳本/`：弱點報告自動化生成工具套件（包含 `pro_fix_report_v1.4.py`、CVE 輸入清單 `cves.txt` 與掃描判讀說明）。

## 3. 適用對象與情境
當對話涉及 Ubuntu 各版本之 CVE 弱點核對、掃描器結果分析比對、Ubuntu Pro / ESM 漏洞修復可行性驗證、合規性測試沙盒搭建或弱點自動化腳本維護時，檔案產出與維護均歸屬本目錄。
