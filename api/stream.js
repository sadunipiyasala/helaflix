export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Video URL is required" });
  }

  try {
    const range = req.headers.range;
    const videoUrl = decodeURIComponent(url);

    const headResponse = await fetch(videoUrl, { method: "HEAD" });
    const fileSize = parseInt(headResponse.headers.get("content-length") || "0", 10);

    if (range && fileSize > 0) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;

      const response = await fetch(videoUrl, {
        headers: { Range: `bytes=${start}-${end}` },
      });

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4",
        "Access-Control-Allow-Origin": "*",
      });

      const readableStream = response.body;
      const reader = readableStream.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(Buffer.from(value));
      }
      res.end();
    } else {
      const response = await fetch(videoUrl);
      res.writeHead(200, {
        "Content-Length": fileSize || response.headers.get("content-length"),
        "Content-Type": "video/mp4",
        "Access-Control-Allow-Origin": "*",
      });

      const readableStream = response.body;
      const reader = readableStream.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(Buffer.from(value));
      }
      res.end();
    }
  } catch (error) {
    console.error("Stream Error:", error);
    res.status(500).json({ error: "Failed to stream video" });
  }
}
