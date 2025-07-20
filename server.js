const express = require("express");
const fetch = require("node-fetch");
const app = express();
const PORT = process.env.PORT || 8080;

app.get("/", async (req, res) => {
  const { id } = req.query;

  try {
    const response = await fetch("https://raw.githubusercontent.com/KiNGTV2025/Kingvercel/main/M3U/Kablonet.m3u");
    const text = await response.text();
    const lines = text.split("\n").map(line => line.trim());

    const kanalListesi = [];

    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(/tvg-id="([^"]+)"[^,]*,(.*)/);
      if (match) {
        kanalListesi.push({ id: match[1], name: match[2] });
      }
    }

    const matchingIndex = lines.findIndex(line => line.includes(`tvg-id="\${id}"`));
    if (!id || matchingIndex === -1) {
      return res.send(\`
        <html>
          <head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Mevcut Kanallar</title></head>
          <body>
            <h1>\${id ? "ID bulunamadı!" : "Geçersiz ID"}</h1>
            <h2>Mevcut Kanallar</h2>
            <ul>\${kanalListesi.map(k => `<li>\${k.id}: \${k.name}</li>`).join("")}</ul>
          </body>
        </html>
      \`);
    }

    const streamUrl = lines[matchingIndex + 1]?.trim();
    if (streamUrl) {
      return res.redirect(streamUrl);
    } else {
      return res.status(404).send("Yayın linki bulunamadı.");
    }

  } catch (error) {
    return res.status(500).send("Sunucu hatası: " + error.message);
  }
});

app.listen(PORT, () => {
  console.log(\`Sunucu \${PORT} portunda çalışıyor.\`);
});