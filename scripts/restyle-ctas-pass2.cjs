const fs = require("fs");
const path = require("path");

const coral = "var(--color-sunrise-coral)";

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

  out = out.replaceAll("rounded-xl bg-[#18181b]", `rounded-full bg-[${coral}]`);
  out = out.replaceAll("rounded-lg bg-[#18181b]", `rounded-full bg-[${coral}]`);

  out = out.replaceAll(
    '? "bg-[#18181b] text-white"',
    `? "bg-[${coral}] text-white"`
  );
  out = out.replaceAll(
    "? 'bg-[#18181b] text-white'",
    `? 'bg-[${coral}] text-white'`
  );
  out = out.replaceAll(
    'primary ? "bg-[#18181b] text-white"',
    `primary ? "bg-[${coral}] text-white"`
  );

  out = out.replaceAll(
    "bg-[#18181b] text-white hover:bg-[#262626]",
    `bg-[${coral}] text-white hover:opacity-90`
  );
  out = out.replaceAll(
    "bg-[#18181b] text-white hover:bg-[#18181b]/90",
    `bg-[${coral}] text-white hover:opacity-90`
  );
  out = out.replaceAll("hover:bg-[#262626]", "hover:opacity-90");
  out = out.replaceAll("hover:bg-[#18181b]/90", "hover:opacity-90");

  out = out.replaceAll(
    "sm:hidden bg-[#18181b] text-white",
    `sm:hidden bg-[${coral}] text-white`
  );
  out = out.replaceAll(
    "bg-[#18181b] px-4 text-sm text-white hover:opacity-90",
    `bg-[${coral}] px-4 text-sm text-white hover:opacity-90`
  );
  out = out.replaceAll(
    '"h-10 w-auto shrink-0 bg-[#18181b] px-4 text-sm text-white hover:opacity-90"',
    `"h-10 w-auto shrink-0 rounded-full bg-[${coral}] px-4 text-sm text-white hover:opacity-90"`
  );
  out = out.replaceAll(
    'cn(actionButtonClass, "bg-[#18181b] text-white hover:opacity-90")',
    `cn(actionButtonClass, "bg-[${coral}] text-white hover:opacity-90")`
  );

  out = out.replaceAll(
    "bg-[#18181b] text-[15px] font-medium text-white hover:bg-[#18181b]",
    `bg-[${coral}] text-[15px] font-medium text-white hover:opacity-90`
  );
  out = out.replaceAll(
    '!disabled && selected && "bg-[#18181b] font-medium text-white"',
    `!disabled && selected && "bg-[${coral}] font-medium text-white"`
  );
  out = out.replaceAll(
    'done ? "border-[#18181b] bg-[#18181b] text-white"',
    `done ? "border-[${coral}] bg-[${coral}] text-white"`
  );
  out = out.replaceAll(
    'view === v ? "bg-[#18181b] text-white" : "bg-[#f4f4f5] text-[#71717a]"',
    `view === v ? "bg-[${coral}] text-white" : "bg-[#f4f4f5] text-[#71717a]"`
  );
  out = out.replaceAll(
    'report === r.id ? "bg-[#18181b] text-white" : "bg-[#f4f4f5] text-[#71717a]"',
    `report === r.id ? "bg-[${coral}] text-white" : "bg-[#f4f4f5] text-[#71717a]"`
  );

  // carousel dots / checkbox fills that are intentionally carbon can stay;
  // replace naked active filters that survived
  out = out.replaceAll(
    "index === activeIndex ? \"w-5 bg-[#18181b]\"",
    `index === activeIndex ? "w-5 bg-[${coral}]"`
  );

  if (out !== s) {
    fs.writeFileSync(f, out);
    n += 1;
    console.log(f);
  }
}
console.log("updated", n);
