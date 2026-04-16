// 👇 請填寫您的安全金鑰（請妥善保管，請勿將包含真實金鑰的代碼直接推送到公開的 GitHub 儲存庫！）
const GEMINI_API_KEY = '請替換成您的_GEMINI_API_KEY'; // 通常是 AIzaSy 開頭
const LINE_ACCESS_TOKEN = '請替換成您的_LINE_ACCESS_TOKEN';
const LINE_USER_ID = '請替換成您的_LINE_USER_ID';

function sendDailyEnglishToLine() {
  var cleanGeminiKey = GEMINI_API_KEY.trim();
  var cleanLineToken = LINE_ACCESS_TOKEN.trim();
  var cleanUserId = LINE_USER_ID.trim();

  // 專為手機閱讀設計的提示詞 (加入主題、20個單字緊湊排版、文章)
  var prompt = 
    "身為多益家教，目標600分。請隨機挑選一個多益常考情境主題。\n" +
    "【任務要求】：\n" +
    "1. 明確顯示本次挑選的主題。\n" +
    "2. 依照該主題，提供 20 個必備單字。\n" +
    "3. 每個單字必須附上一個簡短的實用英文例句及中文翻譯。\n" +
    "4. 提供一篇符合該情境的短篇商業英文閱讀文章及中文翻譯。\n" +
    "【重要排版規定】：\n" +
    "1. 絕對不要使用 Markdown 語法（嚴禁出現 ** 或是 * 符號）。\n" +
    "2. 絕對不要使用表格。\n" +
    "3. 請嚴格依照以下格式輸出，每個單字區塊之間空一行方便閱讀：\n\n" +
    "【🎯 今日主題】：[填入主題名稱]\n\n" +
    "【📚 主題單字精選】\n" +
    "01. [單字] ([詞性]) [中文]\n" +
    "💬 例句：[英文例句] ([中文翻譯])\n\n" +
    "02. [單字] ([詞性]) [中文]\n" +
    "💬 例句：[英文例句] ([中文翻譯])\n\n" +
    "...(依序列出 20 個)...\n\n" +
    "【📝 實戰短文】\n" +
    "[英文文章段落]\n\n" +
    "【🌐 中文翻譯】\n" +
    "[中文翻譯段落]";

  // 1. 呼叫 Gemini 產出內容 (使用 2.5-flash)
  var geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + cleanGeminiKey;
  var geminiPayload = {
    "contents": [{"parts": [{"text": prompt}]}]
  };
  
  var geminiOptions = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(geminiPayload),
    "muteHttpExceptions": true
  };
  
  var englishContent = "";
  try {
    var response = UrlFetchApp.fetch(geminiUrl, geminiOptions);
    var json = JSON.parse(response.getContentText());
    
    // 檢查是否有正確回傳內容
    if (response.getResponseCode() === 200 && json.candidates && json.candidates.length > 0) {
      // 💡 正確宣告 rawText，取得文字後立刻清洗星號
      var rawText = json.candidates[0].content.parts[0].text;
      englishContent = rawText.replace(/\*\*/g, "").replace(/\*/g, "-");
    } else {
      englishContent = "⚠️ 今日生成內容失敗。\n錯誤代碼：" + response.getResponseCode() + "\n錯誤訊息：" + (json.error ? json.error.message : "未知錯誤");
      Logger.log(response.getContentText());
    }
  } catch (e) {
    englishContent = "⚠️ 系統連線發生錯誤：" + e.toString();
  }

  // 2. 透過 LINE API「廣播」給所有加入好友的人
  var lineUrl = "https://api.line.me/v2/bot/message/broadcast";
  
  var linePayload = {
    "messages": [
      {
        "type": "text",
        "text": "🌞 早安！今日多益學習包來囉：\n\n" + englishContent
      }
    ]
  };
  
  var lineOptions = {
    "method": "post",
    "headers": {
      "Authorization": "Bearer " + cleanLineToken
    },
    "contentType": "application/json",
    "payload": JSON.stringify(linePayload),
    "muteHttpExceptions": true
  };
  
  var lineResponse = UrlFetchApp.fetch(lineUrl, lineOptions);
  Logger.log("LINE 廣播狀態: " + lineResponse.getResponseCode());
}
