export default function handler(req, res) {
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="si">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>HelaFlix - Telegram Streamer</title>
        <style>
            body { font-family: Arial, sans-serif; background: #141414; color: #fff; text-align: center; padding: 50px; }
            .container { max-width: 600px; margin: auto; background: #1f1f1f; padding: 30px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
            h1 { color: #e50914; }
            p { color: #aaa; }
            .btn { display: inline-block; background: #e50914; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
            .btn:hover { background: #b20710; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎬 HelaFlix Movies</h1>
            <p>ඔබගේ Telegram චැනල් එකෙන් චිත්‍රපට නරඹන්න සහ ඩවුන්ලෝඩ් කරන්න.</p>
            <a href="https://t.me/YourChannel" class="btn" target="_blank">Join Telegram Channel</a>
        </div>
    </body>
    </html>
  `);
}
