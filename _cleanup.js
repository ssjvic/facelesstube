const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "src", "services", "videoGenerator.js");
const content = fs.readFileSync(filePath, "utf8");
const lines = content.split("\n");

console.log("Total lines before:", lines.length);

// Keep lines 1-39 (index 0-38) and lines 180+ (index 179+)
const header = lines.slice(0, 39);
const body = lines.slice(179);

const clean = [...header, "", ...body];

fs.writeFileSync(filePath, clean.join("\n"), "utf8");
console.log("Total lines after:", clean.length);
console.log("Removed", lines.length - clean.length, "lines of dead code");
console.log("First kept body line:", body[0].substring(0, 60));
