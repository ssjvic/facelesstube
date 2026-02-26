/**
 * Upload 30 gaming background clips to Supabase Storage
 * Picks a diverse mix from GTA, PUBG, Redmogly, Tas_Tanbir, and Capigaming
 * Prioritizing smaller files for faster loading on mobile.
 */

const fs = require("fs");
const path = require("path");

const SUPABASE_URL = "https://bmpxhntqtcgmqghydpxl.supabase.co";
const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtcHhobnRxdGNnbXFnaHlkcHhsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzc2NTQ2NiwiZXhwIjoyMDgzMzQxNDY2fQ.qJlonCi318bgJ4JaTSVIpURGA-xszVq5X2c-VTooowQ";
const BUCKET = "clips";
const VIDEO_DIR =
  "C:\\Users\\ssjvi\\OneDrive\\Desktop\\faceless arreglar\\videos de fondo\\fondos juegos";

// 30 gaming clips — mix of sources, prefer smaller files
const SELECTED_CLIPS = [
  // GTA (2 clips)
  "gta.centre-20240522-0001.mp4",
  "gta.centre-20240522-0002.mp4",

  // PUBG (8 clips — smaller ones)
  "pubg.elitesmemes-20240522-0002.mp4",
  "pubg.elitesmemes-20240522-0006.mp4",
  "pubg.elitesmemes-20240522-0009.mp4",
  "pubg.elitesmemes-20240522-0001.mp4",
  "pubg.elitesmemes-20240522-0003.mp4",
  "pubg.elitesmemes-20240522-0004.mp4",
  "pubg.elitesmemes-20240522-0014.mp4",
  "pubg.elitesmemes-20240522-0015.mp4",

  // Redmogly (5 clips)
  "redmogly-20240522-0001.mp4",
  "redmogly-20240522-0004.mp4",
  "redmogly-20240522-0005.mp4",
  "redmogly-20240522-0002.mp4",
  "redmogly-20240522-0003.mp4",

  // Capigaming (15 clips — smaller ones)
  "youtube.capigaming-20240522-0007.mp4",
  "youtube.capigaming-20240522-0017.mp4",
  "youtube.capigaming-20240522-0001.mp4",
  "youtube.capigaming-20240522-0013.mp4",
  "youtube.capigaming-20240522-0019.mp4",
  "youtube.capigaming-20240522-0027.mp4",
  "youtube.capigaming-20240522-0033.mp4",
  "youtube.capigaming-20240522-0021.mp4",
  "youtube.capigaming-20240522-0028.mp4",
  "youtube.capigaming-20240522-0035.mp4",
  "youtube.capigaming-20240522-0036.mp4",
  "youtube.capigaming-20240522-0040.mp4",
  "youtube.capigaming-20240522-0052.mp4",
  "youtube.capigaming-20240522-0058.mp4",
  "youtube.capigaming-20240522-0056.mp4",
];

async function ensureBucket() {
  console.log("📦 Ensuring bucket exists...");
  const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      apikey: SERVICE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: BUCKET,
      name: BUCKET,
      public: true,
      file_size_limit: 52428800,
      allowed_mime_types: ["video/mp4", "video/quicktime"],
    }),
  });
  const data = await res.text();
  if (res.ok || data.includes("already exists")) {
    console.log("✅ Bucket ready");
  } else {
    console.log("Bucket response:", res.status, data);
  }
}

async function uploadFile(filename) {
  const filePath = path.join(VIDEO_DIR, filename);

  if (!fs.existsSync(filePath)) {
    console.log(`❌ Not found: ${filename}`);
    return null;
  }

  const fileBuffer = fs.readFileSync(filePath);
  const sizeMB = (fileBuffer.length / 1024 / 1024).toFixed(1);

  // Clean filename for storage — prefix with "gaming_"
  const storageName = filename
    .replace(/gta\.centre-\d+-/, "gaming_gta_")
    .replace(/pubg\.elitesmemes-\d+-/, "gaming_pubg_")
    .replace(/redmogly-\d+-/, "gaming_redmogly_")
    .replace(/tas_tanbir-\d+-/, "gaming_tanbir_")
    .replace(/youtube\.capigaming-\d+-/, "gaming_capi_")
    .replace(/\s+/g, "_")
    .toLowerCase();

  console.log(`⬆️  Uploading: ${storageName} (${sizeMB} MB)...`);

  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${storageName}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        apikey: SERVICE_KEY,
        "Content-Type": "video/mp4",
        "x-upsert": "true",
      },
      body: fileBuffer,
    },
  );

  if (res.ok) {
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storageName}`;
    console.log(`✅ Done: ${storageName}`);
    return { name: storageName, url: publicUrl, originalName: filename };
  } else {
    const err = await res.text();
    console.log(`❌ Failed: ${storageName} — ${res.status} ${err}`);
    return null;
  }
}

async function main() {
  console.log(
    `\n🎮 Uploading ${SELECTED_CLIPS.length} gaming clips to Supabase...\n`,
  );

  await ensureBucket();

  const results = [];
  for (let i = 0; i < SELECTED_CLIPS.length; i++) {
    const clip = SELECTED_CLIPS[i];
    console.log(`\n[${i + 1}/${SELECTED_CLIPS.length}]`);
    const result = await uploadFile(clip);
    if (result) results.push(result);

    // Small delay between uploads
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(
    `\n\n✅ Uploaded ${results.length}/${SELECTED_CLIPS.length} gaming clips\n`,
  );

  // Print URLs
  console.log("URLs:");
  results.forEach((r) => console.log(`  ${r.url}`));

  // Print the preinstalledVideos.js entries to add
  const entries = results.map((r, i) => {
    return `  {
    id: "clip_gaming_${i + 1}",
    name: "Gaming ${i + 1}",
    category: "gaming",
    thumbnail: "",
    url: \`\${SUPABASE_CLIPS}/${r.name}\`,
  }`;
  });

  const block = `\n  // ═══════════════════════════════════════════
  // GAMING — Videogame gameplay, action clips
  // ═══════════════════════════════════════════
${entries.join(",\n")}`;

  fs.writeFileSync("gaming_clip_entries.txt", block, "utf8");
  console.log("\n📝 Saved gaming clip entries to gaming_clip_entries.txt");
  console.log("   → Copy-paste this block into preinstalledVideos.js");
}

main().catch(console.error);
