/**
 * Upload 40 varied clips to Supabase Storage
 * Selects a diverse mix from 3 collections:
 * - Faceless Aesthetic (larger, high quality)
 * - Ladies Luxe (medium, versatile)
 * - Aesthetic Videos (varied sizes)
 */

const fs = require("fs");
const path = require("path");

const SUPABASE_URL = "https://bmpxhntqtcgmqghydpxl.supabase.co";
const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtcHhobnRxdGNnbXFnaHlkcHhsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzc2NTQ2NiwiZXhwIjoyMDgzMzQxNDY2fQ.qJlonCi318bgJ4JaTSVIpURGA-xszVq5X2c-VTooowQ";
const BUCKET = "clips";
const VIDEO_DIR =
  "C:\\Users\\ssjvi\\OneDrive\\Desktop\\faceless arreglar\\videos de fondo";

// Select 40 varied clips - mix of all 3 collections, prefer smaller files for faster loading
const SELECTED_CLIPS = [
  // Faceless Aesthetic (10 clips - cinematic/aesthetic)
  "Copia de Faceless Aesthetic Videos Pt. 1.mp4",
  "Copia de Faceless Aesthetic Videos Pt. 1 (1).mp4",
  "Copia de Faceless Aesthetic Videos Pt. 1 (3).mp4",
  "Copia de Faceless Aesthetic Videos Pt. 1 (5).mp4",
  "Copia de Faceless Aesthetic Videos Pt. 1 (11).mp4",
  "Copia de Faceless Aesthetic Videos Pt. 1 (12).mp4",
  "Copia de Faceless Aesthetic Videos Pt. 1 (17).mp4",
  "Copia de Faceless Aesthetic Videos Pt. 1 (26).mp4",
  "Copia de Faceless Aesthetic Videos Pt. 1 (30).mp4",
  "Copia de Faceless Aesthetic Videos Pt. 1 (34).mp4",

  // Ladies Luxe (15 clips - luxury/lifestyle)
  "Ladies Luxe 2.mp4",
  "Ladies Luxe 10.mp4",
  "Ladies Luxe 19.mp4",
  "Ladies Luxe 28.mp4",
  "Ladies Luxe 37.mp4",
  "Ladies Luxe 42.mp4",
  "Ladies Luxe 58.mp4",
  "Ladies Luxe 67.mp4",
  "Ladies Luxe 78.mp4",
  "Ladies Luxe 106.mp4",
  "Ladies Luxe 131.mp4",
  "Ladies Luxe 136.mp4",
  "Ladies Luxe 138.mp4",
  "Ladies Luxe 168.mp4",
  "Ladies Luxe 178.mp4",

  // Aesthetic Videos (15 clips - abstract/ambient/moody)
  "aesthetic videos 271.mp4",
  "aesthetic videos 280.mp4",
  "aesthetic videos 290.mp4",
  "aesthetic videos 300.mp4",
  "aesthetic videos 312.mp4",
  "aesthetic videos 324.mp4",
  "aesthetic videos 341.mp4",
  "aesthetic videos 360.mp4",
  "aesthetic videos 369.mp4",
  "aesthetic videos 390.mp4",
  "aesthetic videos 405.mp4",
  "aesthetic videos 419.mp4",
  "aesthetic videos 424.mp4",
  "aesthetic videos 430.mp4",
  "aesthetic videos 545.mp4",
];

async function createBucket() {
  console.log("📦 Creating bucket...");
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
      file_size_limit: 52428800, // 50MB
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

  // Clean filename for storage
  const storageName = filename
    .replace(/Copia de /g, "")
    .replace(/Faceless Aesthetic Videos Pt\. 1/g, "faceless")
    .replace(/Ladies Luxe /g, "luxe_")
    .replace(/aesthetic videos /g, "aesthetic_")
    .replace(/\s+/g, "_")
    .replace(/[()]/g, "")
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
  console.log(`\n🎬 Uploading ${SELECTED_CLIPS.length} clips to Supabase...\n`);

  await createBucket();

  const results = [];
  for (let i = 0; i < SELECTED_CLIPS.length; i++) {
    const clip = SELECTED_CLIPS[i];
    console.log(`\n[${i + 1}/${SELECTED_CLIPS.length}]`);
    const result = await uploadFile(clip);
    if (result) results.push(result);

    // Small delay between uploads
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(
    `\n\n✅ Uploaded ${results.length}/${SELECTED_CLIPS.length} clips\n`,
  );

  // Generate the preinstalledVideos.js entries
  const entries = results.map((r, i) => {
    // Determine category from original name
    let category = "aesthetic";
    let displayName = r.name.replace(".mp4", "").replace(/_/g, " ");

    if (r.originalName.includes("Faceless")) {
      category = "cinematic";
      displayName = `Faceless ${i + 1}`;
    } else if (r.originalName.includes("Ladies Luxe")) {
      category = "luxury";
      const num = r.originalName.match(/\d+/)?.[0] || i;
      displayName = `Luxe ${num}`;
    } else if (r.originalName.includes("aesthetic")) {
      category = "aesthetic";
      const num = r.originalName.match(/\d+/)?.[0] || i;
      displayName = `Aesthetic ${num}`;
    }

    return `  {\n    id: "clip_${category}_${i + 1}",\n    name: "${displayName}",\n    category: "${category}",\n    thumbnail: "",\n    url: "${r.url}",\n  }`;
  });

  // Write the output file
  const output = `// Generated clip entries — paste into preinstalledVideos.js\nconst NEW_CLIPS = [\n${entries.join(",\n")}\n];\n\nconsole.log(JSON.stringify(NEW_CLIPS, null, 2));\n`;

  fs.writeFileSync("clip_entries.js", output, "utf8");
  console.log("📝 Saved clip entries to clip_entries.js");
  console.log("\nURLs:");
  results.forEach((r) => console.log(`  ${r.url}`));
}

main().catch(console.error);
