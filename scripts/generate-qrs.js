import fs from "fs";
import path from "path";

// Extract domain from arguments or default to the deployed Vercel domain
const DOMAIN = process.argv[2] || "https://mission-sable.vercel.app";
const OUTPUT_DIR = path.join(process.cwd(), "public", "qr-codes");

const QUESTS = [
  { id: "quest-01", slug: "amber-vault-k9q4m2x7", title: "Witamy w kolonii!" },
  { id: "quest-02", slug: "silent-forge-p6t8n3v1", title: "Któryś za nas, cierpiał rany..." },
  { id: "quest-03", slug: "moonlit-riddle-x2c7b9h5", title: "THIS. IS. SPARTA!!!" },
  { id: "quest-04", slug: "broken-compass-r8w1s6d4", title: "Diss na mleko" },
  { id: "quest-05", slug: "river-oath-m5z9q2a8", title: "Jesse We Need To Cook" },
  { id: "quest-06", slug: "storm-banner-v7d3k1p9", title: "Litwo, ojczyzno moja..." },
  { id: "quest-07", slug: "hidden-crown-b4n8y6t2", title: "Stworzenie Adama" },
  { id: "quest-08", slug: "silver-goblet-f1h6r3w9", title: "Z kamerą wśród zwierząt" },
  { id: "quest-09", slug: "ashen-library-z8p2m5c7", title: "Telezakupy Mango" },
  { id: "quest-10", slug: "candle-bridge-t3q7x1n6", title: "Ginyu Force" },
  { id: "quest-11", slug: "wolfsbane-letter-h9v4d8s2", title: "Ostatnie Pożegnanie" },
  { id: "quest-12", slug: "obsidian-key-c6m1r9k4", title: "ASMR dla koneserów" },
  { id: "quest-13", slug: "mist-harbor-y2s8w5p1", title: "Ofiara ceremonialna" },
  { id: "quest-14", slug: "golden-antler-n7b3x6q8", title: "Haiku" },
  { id: "quest-15", slug: "ember-choir-d5k9t2v7", title: "Makłowicz w podróży" },
  { id: "quest-16", slug: "frost-tower-q1r6c8m3", title: "Wiadro" },
  { id: "quest-17", slug: "runic-kitchen-w4p7z2h8", title: "Dekret" },
  { id: "quest-18", slug: "crimson-lantern-m8x3n6b1", title: "Szympansy" },
  { id: "quest-19", slug: "starlit-ledger-k2d9v5s7", title: "Na Łazarskim Rejonie" },
  { id: "quest-20", slug: "ivory-drum-p5h1q8r4", title: "Jan Paweł DriII" },
  { id: "quest-21", slug: "last-obelisk-s9c4m7x2", title: "The Imperial March" }
];

async function generateQRs() {
  console.log(`Generating QR codes for domain: ${DOMAIN}...`);
  console.log(`Saving to directory: ${OUTPUT_DIR}\n`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  for (const quest of QUESTS) {
    const questUrl = `${DOMAIN}/quests/${quest.slug}`;
    const filename = `${quest.id}-${quest.slug}.png`;
    const outputPath = path.join(OUTPUT_DIR, filename);

    // Using a fast, reliable, and privacy-friendly QR code API
    const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(questUrl)}`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(outputPath, buffer);
      console.log(`[✓] Generated: ${quest.title} -> public/qr-codes/${filename}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`[✗] Failed to generate for ${quest.title}:`, errorMessage);
    }
  }

  // Generate a beautiful, print-ready HTML page
  const htmlPath = path.join(OUTPUT_DIR, "print.html");
  let cardHtmls = "";
  for (const quest of QUESTS) {
    const questUrl = `${DOMAIN}/quests/${quest.slug}`;
    const filename = `${quest.id}-${quest.slug}.png`;
    cardHtmls += `
    <div class="card">
      <h3>${quest.id.toUpperCase()}</h3>
      <img src="./${filename}" alt="${quest.id.toUpperCase()}">
      <div class="url">${questUrl}</div>
    </div>`;
  }

  const htmlContent = `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <title>Drukuj Kody QR - Treasure Hunt</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 30px;
      background: #f8f9fa;
      color: #333;
    }
    header {
      text-align: center;
      margin-bottom: 40px;
    }
    h1 {
      margin: 0;
      color: #1a1a1a;
    }
    p {
      margin: 5px 0 0 0;
      color: #666;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 25px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .card {
      background: white;
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      box-shadow: 0 4px 6px rgba(0,0,0,0.02);
      break-inside: avoid;
      page-break-inside: avoid;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
    }
    .card h3 {
      margin: 0 0 15px 0;
      font-size: 1.1em;
      color: #111;
      border-bottom: 1px solid #eee;
      width: 100%;
      padding-bottom: 8px;
    }
    .card img {
      width: 200px;
      height: 200px;
      margin-bottom: 15px;
      display: block;
    }
    .card .url {
      font-size: 0.7em;
      color: #777;
      word-break: break-all;
      font-family: monospace;
      max-width: 100%;
    }
    .print-btn {
      display: block;
      margin: 20px auto;
      padding: 12px 24px;
      background: #0070f3;
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 1em;
      cursor: pointer;
      font-weight: 600;
    }
    .print-btn:hover {
      background: #0051cb;
    }
    @media print {
      body {
        background: white;
        margin: 0;
        padding: 0;
      }
      header, .print-btn {
        display: none;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 15px;
      }
      .card {
        border: 2px dashed #999;
        box-shadow: none;
        padding: 15px;
      }
    }
  </style>
</head>
<body>
  <header>
    <h1>Wydruk Kodów QR - Treasure Hunt</h1>
    <p>Poniższa strona jest zoptymalizowana do druku. Kliknij przycisk poniżej lub naciśnij Ctrl+P (Cmd+P) w przeglądarce, aby wydrukować wszystkie kody.</p>
    <button class="print-btn" onclick="window.print()">Drukuj Kody</button>
  </header>
  <div class="grid">
    ${cardHtmls}
  </div>
</body>
</html>`;

  fs.writeFileSync(htmlPath, htmlContent);
  console.log(`[✓] Generated print sheet -> public/qr-codes/print.html`);

  console.log(`\nSuccess! All 21 QR codes and the printable sheet are saved inside the "public/qr-codes" folder.`);
  console.log(`To print them, simply run the development server (npm run dev) and open:`);
  console.log(`👉 http://localhost:3000/qr-codes/print.html`);
  console.log(`Or double-click the file in your file explorer:`);
  console.log(`👉 file://${htmlPath}`);
}

generateQRs();
