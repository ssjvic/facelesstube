// cleanup_dashboard.js - Remove orphaned video section code
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "src", "pages", "Dashboard.jsx");
const content = fs.readFileSync(filePath, "utf8");
const lines = content.split("\n");

console.log("Total lines before:", lines.length);

// Find the markers
const estiloVisualEnd = lines.findIndex(
  (l, i) =>
    i > 1200 &&
    l.trim() === "</div>" &&
    lines[i - 1]?.includes("</span>") &&
    lines[i - 2]?.includes("text-white/50"),
);
console.log("Estilo Visual section ends at line:", estiloVisualEnd + 1);

const musicSectionStart = lines.findIndex(
  (l, i) => i > 1200 && l.includes("Music Section"),
);
console.log("Music section starts at line:", musicSectionStart + 1);

if (estiloVisualEnd > 0 && musicSectionStart > estiloVisualEnd) {
  // Keep everything up to and including the estilo visual end,
  // then skip to the music section
  const before = lines.slice(0, estiloVisualEnd + 1);
  const after = lines.slice(musicSectionStart - 1); // include the blank line before music section
  const result = [...before, "", ...after];

  fs.writeFileSync(filePath, result.join("\n"), "utf8");
  console.log("Total lines after:", result.length);
  console.log("Removed", lines.length - result.length, "orphaned lines");
  console.log("SUCCESS");
} else {
  console.log("ERROR: Could not find markers");
  console.log("estiloVisualEnd:", estiloVisualEnd);
  console.log("musicSectionStart:", musicSectionStart);
}
