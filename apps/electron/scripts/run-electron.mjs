import { spawn } from "node:child_process";
import http from "node:http";

const appUrl = "http://127.0.0.1:5173";
const apiUrl = "http://127.0.0.1:5175/api/health";
const isWindows = process.platform === "win32";

function isServerReady(url = appUrl) {
  return new Promise((resolve) => {
    const request = http.get(url, (response) => {
      response.resume();
      resolve(response.statusCode >= 200 && response.statusCode < 500);
    });

    request.on("error", () => resolve(false));
    request.setTimeout(1000, () => {
      request.destroy();
      resolve(false);
    });
  });
}

function spawnCommand(command, args, options = {}) {
  return spawn(command, args, {
    stdio: "inherit",
    shell: isWindows,
    ...options,
  });
}

async function waitForServer(url = appUrl, timeoutMs = 30_000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (await isServerReady(url)) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Timed out waiting for ${url}`);
}

async function main() {
  let devServer = null;
  let apiServer = null;

  if (await isServerReady(apiUrl)) {
    console.log(`Using existing API server at ${apiUrl}`);
  } else {
    console.log(`Starting API server at ${apiUrl}`);
    apiServer = spawnCommand("npm", ["run", "api"]);
    await waitForServer(apiUrl);
  }

  if (await isServerReady()) {
    console.log(`Using existing dev server at ${appUrl}`);
  } else {
    console.log(`Starting dev server at ${appUrl}`);
    devServer = spawnCommand("npm", ["run", "dev"]);
    await waitForServer();
  }

  const electron = spawnCommand("electron", ["."]);

  electron.on("exit", (code) => {
    if (devServer) {
      devServer.kill();
    }

    if (apiServer) {
      apiServer.kill();
    }

    process.exit(code ?? 0);
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
