const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "../src/app/api");
const importLine = 'import { apiErrorResponse } from "@/lib/api/respond";';

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, files);
    else if (ent.name.endsWith(".ts")) files.push(p);
  }
  return files;
}

for (const file of walk(root)) {
  let src = fs.readFileSync(file, "utf8");
  const orig = src;
  src = src.replace(
    /return NextResponse\.json\(\{ error: error\.message \}, \{ status: 500 \}\);/g,
    "return apiErrorResponse(error.message, 500);"
  );
  src = src.replace(
    /return NextResponse\.json\(\{ error: error\.message \}, \{ status: 404 \}\);/g,
    "return apiErrorResponse(error.message, 404);"
  );
  if (src !== orig) {
    if (!src.includes("@/lib/api/respond")) {
      const end = src.indexOf("\n", src.indexOf("import "));
      src = src.slice(0, end + 1) + importLine + "\n" + src.slice(end + 1);
    }
    fs.writeFileSync(file, src);
    console.log("updated", path.relative(root, file));
  }
}
