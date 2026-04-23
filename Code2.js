// 👇 請填寫您的安全金鑰（請妥善保管，請勿將包含真實金鑰的代碼直接推送到公開的 GitHub 儲存庫！）
const GEMINI_API_KEY_QUIZ = '請替換成您的_GEMINI_API_KEY'; 
const LINE_ACCESS_TOKEN_QUIZ = '請替換成您的_LINE_ACCESS_TOKEN';
const LINE_USER_ID_QUIZ = '請替換成您的_LINE_USER_ID';

/**
 * 執行每週多益測驗發送 (Pro 優化版)
 */
function sendWeeklyQuizToLine() {
  const cleanGeminiKey = GEMINI_API_KEY_QUIZ.trim();
  const cleanLineToken = LINE_ACCESS_TOKEN_QUIZ.trim();
  const cleanUserId = LINE_USER_ID_QUIZ.trim();

  const prompt = 
    "身為多益專業講師。請根據多益考試（TOEIC）常考主題，提供 5 題「句子填空與語法選擇題」。\n" +
    "【任務要求】：\n" +
    "1. 題目難度設定在 600-750 分之間。\n" +
    "2. 每題包含一個英文題目（中間有空格）、四個選項 (A, B, C, D)。\n" +
    "3. 在題目下方直接提供「正確答案」與「中文解析」（包含單字解釋與文法重點）。\n" +
    "【重要排版規定】：\n" +
    "1. 絕對不要使用 Markdown 語法（例如 ** 或 *）。\n" +
    "2. 請嚴格依照以下格式輸出，題與題之間請空一行：\n\n" +
    "【📝 每週多益實戰測驗】\n\n" +
    "Q1. [題目內容]\n" +
    "(A) [選項A]\n" +
    "(B) [選項B]\n" +
    "(C) [選項C]\n" +
    "(D) [選項D]\n" +
    "✅ 正確答案：[A/B/C/D]\n" +
    "💡 關鍵解析：[中文解析內容]\n\n" +
    "...(依序列出 5 題)...";

  const geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + cleanGeminiKey;
  
  const geminiOptions = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify({ "contents": [{"parts": [{"text": prompt}]}] }),
    "muteHttpExceptions": true
  };
  
  let quizContent = "";
  let isSuccess = false;
  let maxRetries = 5;
  let retryDelay = 5000;

  for (let i = 1; i <= maxRetries; i++) {
    try {
      console.log(`嘗試第 ${i} 次呼叫測驗生成 API...`);
      const response = UrlFetchApp.fetch(geminiUrl, geminiOptions);
      const responseCode = response.getResponseCode();
      const json = JSON.parse(response.getContentText());

      if (responseCode === 200 && json.candidates && json.candidates.length > 0) {
        const rawText = json.candidates[0].content.parts[0].text;
        quizContent = rawText.replace(/\*\*/g, "").replace(/\*/g, "-");
        isSuccess = true;
        break; 
      } else if (responseCode === 503 || responseCode === 429) {
        Utilities.sleep(retryDelay);
        retryDelay *= 1.5;
      } else {
        quizContent = `錯誤代碼：${responseCode}\n訊息：${json.error ? json.error.message : "未知錯誤"}`;
        break;
      }
    } catch (e) {
      if (i === maxRetries) quizContent = "連線異常：" + e.toString();
      Utilities.sleep(retryDelay);
    }
  }

  const lineUrl = isSuccess ? "https://api.line.me/v2/bot/message/broadcast" : "https://api.line.me/v2/bot/message/push";
  const linePayload = {
    "messages": [{
      "type": "text",
      "text": isSuccess ? "✍️ 週末到了，來挑戰本週的多益實戰測驗吧！\n\n" + quizContent : "🛠 系統通知：測驗教材生成失敗。\n" + quizContent
    }]
  };

  if (!isSuccess) linePayload.to = cleanUserId;

  const lineOptions = {
    "method": "post",
    "headers": { "Authorization": "Bearer " + cleanLineToken },
    "contentType": "application/json",
    "payload": JSON.stringify(linePayload),
    "muteHttpExceptions": true
  };
  
  UrlFetchApp.fetch(lineUrl, lineOptions);
}
