const fs = require("fs");
const f = "src/pages/Dashboard.jsx";
const lines = fs.readFileSync(f, "utf8").split("\n");
console.log("Total lines before:", lines.length);
// Delete lines 1213-1369 (0-indexed: 1212-1368)
const result = [...lines.slice(0, 1212), "", ...lines.slice(1369)];
fs.writeFileSync(f, result.join("\n"), "utf8");
console.log("Total lines after:", result.length);
console.log("Done!");
