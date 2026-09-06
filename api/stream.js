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

  try {
    const fileMetaRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?chat_id=${CHANNEL_ID}&message_id=${msgId}`);
    const fileMetaData = await fileMetaRes.json();

    if (!fileMetaData.ok) {
      return res.status(404).send("Video not found.");
    }

    const filePath = fileMetaData.result.file_path;
    const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;

    // ටෙලිග්‍රාම් සර්වර් එකේ සෘජු ලින්ක් එකට රීඩිරෙක්ට් කිරීම (Redirect)
    res.redirect(302, fileUrl);

  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
}
