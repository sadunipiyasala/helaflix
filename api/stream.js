export default async function handler(req, res) {
  const { url, id } = req.query;
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const CHANNEL_ID = process.env.CHANNEL_ID;

  let msgId = id;
  if (url) {
    const match = url.match(/\/(\d+)\/?$/);
    if (match) {
      msgId = match[1];
    }
  }

  if (!msgId) {
    return res.status(400).send("Video ID is missing");
  }

  if (!BOT_TOKEN || !CHANNEL_ID) {
    return res.status(500).send("Environment variables BOT_TOKEN or CHANNEL_ID are not set.");
  }

  try {
    const telegramApiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getFile?chat_id=${CHANNEL_ID}&message_id=${msgId}`;
    const fileMetaRes = await fetch(telegramApiUrl);
    const fileMetaData = await fileMetaRes.json();

    // Telegram එකෙන් එන මුල්ම ප්‍රතිචාරය (Response එක) සයිට් එකේ පෙන්වීම (ප්‍රශ්නය බලාගැනීමට)
    if (!fileMetaData.ok) {
      return res.status(400).json({
        error: "Telegram API Error",
        details: fileMetaData,
        used_channel: CHANNEL_ID,
        used_msg_id: msgId
      });
    }

    const filePath = fileMetaData.result.file_path;
    const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;
    res.redirect(302, fileUrl);

  } catch (err) {
    res.status(500).json({ error: "Server Exception", message: err.message });
  }
}
