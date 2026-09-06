export const config = {
  api: {
    responseLimit: false,
  },
};

export default async function handler(req, res) {
  const { id } = req.query; // Telegram message id එක
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const CHANNEL_ID = process.env.CHANNEL_ID;

  if (!id) {
    return res.status(400).send("Video ID is missing");
  }

  try {
    // 1. Telegram එකෙන් ෆයිල් එකේ පාර (File Path) ලබා ගැනීම
    const fileMetaRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?chat_id=${CHANNEL_ID}&message_id=${id}`);
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

    // Readable Stream එක බ්‍රව්සරයට යැවීම
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
