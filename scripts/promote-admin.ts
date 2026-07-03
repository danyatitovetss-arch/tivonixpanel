import { createAdminClient } from "../src/lib/supabase/admin";

async function main() {
  const email = process.env.ADMIN_EMAIL;
  if (!email) {
    console.error("FAIL: ADMIN_EMAIL is not set");
    process.exit(1);
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.rpc("promote_admin_by_email", { p_email: email });
    if (error) {
      console.error("FAIL:", error.message);
      process.exit(1);
    }
    console.log("SUCCESS: admin promoted for", email.replace(/(.{2}).+(@.*)/, "$1***$2"));
  } catch (e) {
    console.error("FAIL:", e instanceof Error ? e.message : "unknown error");
    process.exit(1);
  }
}

main();
