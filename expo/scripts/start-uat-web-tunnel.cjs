const { spawn, spawnSync } = require("node:child_process");
const path = require("node:path");

const MIN_NGROK_VERSION = [3, 20, 0];
const port = process.env.UAT_PORT || "8081";
const projectRoot = path.resolve(__dirname, "..");

function isLocalNgrok(candidate) {
  const normalized = candidate.toLowerCase();
  return (
    normalized.includes(`${path.sep}node_modules${path.sep}.bin${path.sep}`) ||
    normalized.includes(`${path.sep}node_modules${path.sep}@expo${path.sep}ngrok-bin${path.sep}`)
  );
}

function parseVersion(output) {
  const match = output.match(/(\d+)\.(\d+)\.(\d+)/);
  if (!match) return null;
  return match.slice(1).map((part) => Number(part));
}

function isAtLeast(version, minimum) {
  for (let index = 0; index < minimum.length; index += 1) {
    if (version[index] > minimum[index]) return true;
    if (version[index] < minimum[index]) return false;
  }
  return true;
}

function commandCandidates(command) {
  const lookupCommand = process.platform === "win32" ? "where.exe" : "which";
  const result = spawnSync(lookupCommand, [command], {
    encoding: "utf8",
    shell: false,
  });

  if (result.status !== 0 || !result.stdout.trim()) return [];

  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function resolveNgrok() {
  if (process.env.NGROK_PATH) {
    return process.env.NGROK_PATH;
  }

  return commandCandidates("ngrok").find((candidate) => !isLocalNgrok(candidate));
}

function verifyNgrok(command) {
  if (!command) {
    console.error(
      [
        "ngrok v3.20.0+ was not found on PATH.",
        "Install the current ngrok agent, then reopen PowerShell:",
        "  winget install --id Ngrok.Ngrok -e",
        "",
        "If ngrok is installed outside PATH, run with:",
        "  $env:NGROK_PATH='C:\\path\\to\\ngrok.exe'; bun run uat-web-tunnel",
      ].join("\n")
    );
    process.exit(1);
  }

  const result = spawnSync(command, ["version"], {
    encoding: "utf8",
    shell: false,
  });
  const output = `${result.stdout || ""}${result.stderr || ""}`;
  const version = parseVersion(output);

  if (result.status !== 0 || !version || !isAtLeast(version, MIN_NGROK_VERSION)) {
    console.error(
      [
        `ngrok v3.20.0+ is required for UAT. Found: ${output.trim() || "unknown"}`,
        "Update ngrok, then reopen PowerShell:",
        "  ngrok update",
        "or:",
        "  winget upgrade --id Ngrok.Ngrok -e",
      ].join("\n")
    );
    process.exit(1);
  }

  return output.trim();
}

function spawnChild(command, args, label) {
  const child = spawn(command, args, {
    cwd: projectRoot,
    env: process.env,
    shell: false,
    stdio: "inherit",
    windowsHide: false,
  });

  child.on("error", (error) => {
    console.error(`[${label}] ${error.message}`);
    shutdown(1);
  });

  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    if (code !== 0) {
      console.error(`[${label}] exited with code ${code ?? signal}`);
      shutdown(code || 1);
    }
  });

  children.push(child);
  return child;
}

const children = [];
let shuttingDown = false;

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) child.kill();
  }
  setTimeout(() => process.exit(code), 100);
}

const ngrokCommand = resolveNgrok();
const ngrokVersion = verifyNgrok(ngrokCommand);

console.log(`Using ${ngrokVersion}`);
console.log(`Starting Orchard web UAT on http://localhost:${port}`);
console.log("Use the HTTPS forwarding URL printed by ngrok for Android Chrome UAT.");
console.log("");

const bunCommand = process.platform === "win32" ? "bun.exe" : "bun";
spawnChild(bunCommand, ["expo", "start", "--web", "--port", port], "expo");
spawnChild(ngrokCommand, ["http", port], "ngrok");

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
