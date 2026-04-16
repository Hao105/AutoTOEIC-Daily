# AutoTOEIC-Daily

這是一個每日定時發送英文單字與文章至 LINE 官方帳號的自動推播專案。

## 專案特色

- **LINE 廣播**：自動推播英文單字及閱讀文章至用戶的 LINE 內。
- **Google 試算表 (Google Sheets) 整合**：透過 Google 試算表作為資料庫，方便管理推播內容。
- **Google Apps Script (GAS)**：後端運行環境，支援定時觸發器 (Time-driven triggers) 來執行每日推播任務。

## 目錄結構
*(待補充：將您的 Google Apps Script 程式碼匯出至此目錄中)*

## 如何使用

1. 將環境變數或 LINE Channel Access Token 設定於 Google Apps Script 專案的屬性中。
2. 在 Google Sheets 建立單字與文章資料。
3. 部署 GAS 專案並設定定時觸發器 (Cron job) 每日執行發送邏輯。
