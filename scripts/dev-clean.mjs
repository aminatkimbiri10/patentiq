import { rmSync } from "node:fs";
import { execSync, spawn } from "node:child_process";

function killPort(port) {
  try {
    if (process.platform === "win32") {
      const out = execSync(`netstat -ano | findstr :${port}`, { encoding: "utf8" });
      const pids = new Set();
      for (const line of out.split("\n")) {
        if (!line.includes("LISTENING")) continue;
        const pid = line.trim().split(/\s+/).pop();
        if (pid && pid !== "0") pids.add(pid);
      }
      for (const pid of pids) {
        try {
          execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
        } catch {
          /* ignore */
        }
      }
    } else {
      execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`, {
        shell: true,
        stdio: "ignore",
      });
    }
  } catch {
    /* port libre */
  }
}

console.log("Nettoyage du cache .next…");
try {
  rmSync(".next", { recursive: true, force: true });
} catch {
  /* ignore */
}

for (const port of [3000, 3001]) {
  console.log(`Libération du port ${port}…`);
  killPort(port);
}

console.log("Démarrage sur http://localhost:3000");
const child = spawn("npx", ["next", "dev", "-p", "3000"], {
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => process.exit(code ?? 0));
