export default async function handler(req, res) {
  const { url, id } = req.query;
  const BOT_TOKEN = process.env.BOT_TOKEN;

  let msgId = id;
  let username = "helaflix"; // ඔයාගේ Public Channel එකේ Username එක (මෙතන `@` නැතුව දාන්න)

  if (url) {
    // https://t.me/helaflix/7 වගේ ලින්ක් එකකින් username සහ message id එක වෙන් කරගැනීම
    const match = url.match(/t\.me\/([^\/]+)\/(\d+)/);
    if (match) {
      username = match[1];
      msgId = match[2];
    } else {
      const numMatch = url.match(/\/(\d+)\/?$/);
      if (numMatch) msgId = numMatch[1];
    }
  }

  if (!msgId) {
    return res.status(400).send("Video ID is missing or invalid URL.");
  }

  try {
    // Public Channel එකක් නිසා @username එක පාවිච්චි කළ හැක
    const chatIdentifier = `@${username}`;
    const telegramApiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getFile?chat_id=${chatIdentifier}&message_id=${msgId}`;
    
    const fileMetaRes = await fetch(telegramApiUrl);
    const fileMetaData = await fileMetaRes.json();

    if (!fileMetaData.ok) {
      return res.status(400).json({
        error: "Telegram API Error",
        details: fileMetaData,
        used_channel: chatIdentifier,
        used_msg_id: msgId
      });
    }

    const filePath = fileMetaData.result.file_path;
    const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;

    // ටෙලිග්‍රාම් සර්වර් එකෙන් වීඩියෝ එකට රීඩිරෙක්ට් කිරීම
    res.redirect(302, fileUrl);

  } catch (err) {
    res.status(500).json({ error: "Server Exception", message: err.message });
  }
}
