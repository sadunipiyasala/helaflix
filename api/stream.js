export const config = {
  api: {
    responseLimit: false,
  },
};

export default async function handler(req, res) {
  const { url, id } = req.query; // Telegram link එක හෝ id එක ලබා ගැනීම
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const CHANNEL_ID = process.env.CHANNEL_ID;

  let msgId = id;

  // සම්පූර්ණ t.me/c/... ලින්ක් එකක් දුන්නොත් ඒකෙන් ID එක වෙන් කරගැනීම
  if (url) {
    const match = url.match(/\/(\d+)\/?$/);
    if (match) {
      msgId = match[1];
    }
  }

  if (!msgId) {
    return res.status(400).send("Video ID or Telegram URL is missing");
  }

  try {
    // 1. Telegram එකෙන් ෆයිල් එකේ පාර (File Path) ලබා ගැනීම
    const fileMetaRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?chat_id=${CHANNEL_ID}&message_id=${msgId}`);
    const fileMetaData = await fileMetaRes.json();

    if (!fileMetaData.ok) {
      return res.status(404).send("Video not found in private channel.");
    }

    const filePath = fileMetaData.result.file_path;
    const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;

    // 2. Client එකට වීඩියෝ එක ස්ට්‍රීම් (Stream) කිරීම
    const videoRes = await fetch(fileUrl);
    
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Accept-Ranges', 'bytes');
    
    if (videoRes.headers.get('content-length')) {
      res.setHeader('Content-Length', videoRes.headers.get('content-length'));
    }

    const reader = videoRes.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
    res.end();

  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
}
