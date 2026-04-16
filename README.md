# AutoTOEIC-Daily

這是一個每日定時發送英文單字與文章至 LINE 官方帳號的自動推播專案。透過 Google Apps Script (GAS) 結合 Gemini API，每日自動生成多益學習內容並由 LINE 廣播給所有訂閱者。

## 系統流程圖
```mermaid
graph TD;
    A[Google Apps Script \n Time-driven Trigger] -->|每日定時觸發| B(執行 sendDailyEnglishToLine)
    B -->|發送 600分多益提示詞| C{Gemini \n Generative AI}
    C -->|回傳 JSON 格式:\n 20個單字 + 短篇閱讀| D[字串處理\n去除 Markdown 星號]
    D -->|組合廣播訊息| E[LINE Messaging API\nBroadcast Endpoint]
    E -->|推播到使用者的 LINE| F((LINE 使用者))
```

## 專案特色

- **AI 自動生成 (Gemini API)**：每日動態生成多益情境單字及短篇商業文章，保證每日內容不同。
- **LINE 廣播 (Broadcast)**：自動推播學習內容至 LINE 官方帳號的所有訂閱者。
- **純雲端執行 (Google Apps Script)**：不需要伺服器，利用 GAS 內建的每日定時觸發器 (Cron) 自動運行。

## 目錄結構
- `Code.js`：Google Apps Script 的主要邏輯腳本（已隱藏敏感金鑰）。

## 如何使用

1. 前往 [Google Apps Script](https://script.google.com/) 建立一個新專案。
2. 將 `Code.js` 的內容複製貼上。
3. 替換程式碼頂端的常數為您自己真實的 Token：
   - `GEMINI_API_KEY`: 您的 Gemini API Key。
   - `LINE_ACCESS_TOKEN`: LINE 官方帳號的 Channel Access Token。
4. 在 GAS 專案左側選單選擇「觸發條件 (Triggers)」。
5. 新增觸發條件，選擇 `sendDailyEnglishToLine` 函式，並設定為「時間驅動」的「每日計時器」，指定您希望發送的時間（例如：早上 8:00 - 9:00）。
