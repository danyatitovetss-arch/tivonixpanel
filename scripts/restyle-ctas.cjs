const fs = require("fs");
const path = require("path");

function walk(d, files = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, files);
    else if (/\.tsx$/.test(e.name)) files.push(p);
  }
  return files;
}

let n = 0;
for (const f of walk("src")) {
  let s = fs.readFileSync(f, "utf8");
  let out = s;
  out = out.replaceAll("rounded-full bg-[#18181b]", "rounded-full bg-[var(--color-sunrise-coral)]");
  out = out.replaceAll("rounded-[9999px] bg-[#18181b]", "rounded-[9999px] bg-[var(--color-sunrise-coral)]");
  out = out.replaceAll(
    'bg-[#18181b] text-white hover:bg-[#18181b]/90',
    "bg-[var(--color-sunrise-coral)] text-white hover:opacity-90"
  );
  out = out.replaceAll(
    "bg-[#18181b] px-5 text-sm font-medium text-white",
    "bg-[var(--color-sunrise-coral)] px-5 text-sm font-bold text-white"
  );
  out = out.replaceAll(
    "bg-[#18181b] px-4 text-sm font-medium text-white",
    "bg-[var(--color-sunrise-coral)] px-4 text-sm font-bold text-white"
  );
  out = out.replaceAll(
    "inline-flex h-10 items-center rounded-full bg-[#18181b]",
    "inline-flex h-10 items-center rounded-full bg-[var(--color-sunrise-coral)]"
  );
  if (out !== s) {
    fs.writeFileSync(f, out);
    n += 1;
    console.log(f);
  }
}
console.log("cta files", n);
