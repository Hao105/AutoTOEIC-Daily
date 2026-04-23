// 👇 請填寫您的安全金鑰（請妥善保管，請勿將包含真實金鑰的代碼直接推送到公開的 GitHub 儲存庫！）
const GEMINI_API_KEY = '請替換成您的_GEMINI_API_KEY'; 
const LINE_ACCESS_TOKEN = '請替換成您的_LINE_ACCESS_TOKEN';
const LINE_USER_ID = '請替換成您的_LINE_USER_ID';

/**
 * 每日發送多益學習包 (Pro 優化版)
 */
function sendDailyEnglishToLine() {
  var cleanGeminiKey = GEMINI_API_KEY.trim();
  var cleanLineToken = LINE_ACCESS_TOKEN.trim();
  var cleanUserId = LINE_USER_ID.trim();

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
    "03. [單字] ([詞性]) [中文]\n" +
    "💬 例句：[英文例句] ([中文翻譯])\n\n" +
    "【📝 實戰短文】\n" +
    "[英文文章段落]\n\n" +
    "【🌐 中文翻譯】\n" +
    "[中文翻譯段落]";

  var geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + cleanGeminiKey;
  
  var geminiOptions = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify({ "contents": [{"parts": [{"text": prompt}]}] }),
    "muteHttpExceptions": true
  };
  
  var englishContent = "";
  var isSuccess = false;
  var maxRetries = 5;
  var retryDelay = 5000;

  for (var i = 1; i <= maxRetries; i++) {
    try {
      Logger.log("嘗試第 " + i + " 次呼叫 Gemini API...");
      var response = UrlFetchApp.fetch(geminiUrl, geminiOptions);
      var responseCode = response.getResponseCode();
      var json = JSON.parse(response.getContentText());

      if (responseCode === 200 && json.candidates && json.candidates.length > 0) {
        var rawText = json.candidates[0].content.parts[0].text;
        englishContent = rawText.replace(/\*\*/g, "").replace(/\*/g, "-");
        isSuccess = true;
        break; 
      } else if (responseCode === 503 || responseCode === 429) {
        Utilities.sleep(retryDelay);
        retryDelay *= 1.5;
      } else {
        englishContent = "錯誤代碼：" + responseCode + "\n訊息：" + (json.error ? json.error.message : "未知錯誤");
        break;
      }
    } catch (e) {
      if (i === maxRetries) englishContent = "連線異常：" + e.toString();
      Utilities.sleep(retryDelay);
    }
  }

  var lineUrl = isSuccess ? "https://api.line.me/v2/bot/message/broadcast" : "https://api.line.me/v2/bot/message/push";
  var linePayload = {
    "messages": [{
      "type": "text",
      "text": isSuccess ? "🌞 早安！今日多益學習包 (Pro版) 抵達：\n\n" + englishContent : "🛠 系統通知：教材生成失敗。\n" + englishContent
    }]
  };

  if (!isSuccess) linePayload.to = cleanUserId;

  var lineOptions = {
    "method": "post",
    "headers": { "Authorization": "Bearer " + cleanLineToken },
    "contentType": "application/json",
    "payload": JSON.stringify(linePayload),
    "muteHttpExceptions": true
  };
  
  UrlFetchApp.fetch(lineUrl, lineOptions);
}
