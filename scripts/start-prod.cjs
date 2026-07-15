#!/usr/bin/env node
/**
 * Cross-platform production starter (Windows / Linux / macOS).
 * Usage: node scripts/start-prod.cjs
 */
const { spawn } = require("child_process");
const path = require("path");

const port = String(process.env.PORT || "3000").replace(/[^\d]/g, "") || "3000";
const host = process.env.HOST || "0.0.0.0";

const nextBin = path.join(
  __dirname,
  "..",
  "node_modules",
  "next",
  "dist",
  "bin",
  "next"
);

const child = spawn(process.execPath, [nextBin, "start", "-H", host, "-p", port], {
  stdio: "inherit",
  env: process.env,
  shell: false,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
