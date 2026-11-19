const { app, BrowserWindow, shell, ipcMain, dialog } = require("electron");
const path = require("node:path");
const os = require("node:os");
const fs = require("node:fs/promises");

let win;
const safeLocalEndpoint = (value) => {
  try {
    const u = new URL(value);
    return ["http:", "https:"].includes(u.protocol) && !u.username && !u.password;
  } catch { return false; }
};

function createWindow() {
  win = new BrowserWindow({
    width: 1600,
    height: 980,
    minWidth: 1120,
    minHeight: 720,
    title: "NOVA",
    backgroundColor: "#080713",
    frame: false,
    fullscreen: true,
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  win.loadFile(path.join(__dirname, "index.html"));
  win.once("ready-to-show", () => win.show());
}

ipcMain.handle("nova:window", (_event, action) => {
  if (!win) return;
  if (action === "minimize") win.minimize();
  if (action === "toggle-fullscreen") win.setFullScreen(!win.isFullScreen());
  if (action === "close") win.close();
});

ipcMain.handle("nova:open-external", async (_event, url) => {
  if (typeof url !== "string" || !/^https:\/\//i.test(url)) throw new Error("Yalnızca HTTPS bağlantıları açılabilir.");
  await shell.openExternal(url);
  return true;
});

ipcMain.handle("nova:open-path", async (_event, target) => {
  const allowed = {
    home: app.getPath("home"),
    downloads: app.getPath("downloads"),
    documents: app.getPath("documents"),
    desktop: app.getPath("desktop"),
    applications: "/Applications"
  };
  const pathToOpen = allowed[target];
  if (!pathToOpen) throw new Error("Bu konum desteklenmiyor.");
  await shell.openPath(pathToOpen);
  return true;
});

ipcMain.handle("nova:choose-files", async () => {
  const result = await dialog.showOpenDialog(win, {
    title: "NOVA'ya dosya ekle",
    properties: ["openFile", "multiSelections"]
  });
  if (result.canceled) return [];
  return Promise.all(result.filePaths.map(async (filePath) => {
    const stat = await fs.stat(filePath);
    return { name: path.basename(filePath), path: filePath, size: stat.size, modified: stat.mtime.toISOString() };
  }));
});

ipcMain.handle("nova:open-file", async (_event, filePath) => {
  if (typeof filePath !== "string") throw new Error("Geçersiz dosya yolu.");
  const stat = await fs.stat(filePath);
  if (!stat.isFile()) throw new Error("Seçilen öğe bir dosya değil.");
  await shell.openPath(filePath);
  return true;
});

ipcMain.handle("nova:system-info", async () => {
  const total = os.totalmem();
  const free = os.freemem();
  const cpus = os.cpus();
  const load = os.loadavg()[0] / Math.max(1, cpus.length) * 100;
  return {
    platform: process.platform,
    arch: process.arch,
    hostname: os.hostname(),
    totalMemory: total,
    usedMemory: total - free,
    memoryPercent: Math.round((total - free) / total * 100),
    cpuPercent: Math.min(100, Math.round(load)),
    cpuName: cpus[0]?.model || "CPU",
    cores: cpus.length,
    appVersion: app.getVersion(),
    home: app.getPath("home")
  };
});

ipcMain.handle("nova:ollama-models", async (_event, endpoint) => {
  if (!safeLocalEndpoint(endpoint)) throw new Error("Ollama adresi geçersiz.");
  const response = await fetch(new URL("/api/tags", endpoint), { signal: AbortSignal.timeout(4500) });
  if (!response.ok) throw new Error("Ollama yanıt vermedi (" + response.status + ").");
  const data = await response.json();
  return (data.models || []).map((m) => ({ name: m.name, size: m.size, family: m.details?.family || "local" }));
});

ipcMain.handle("nova:ollama-chat", async (_event, payload) => {
  const endpoint = payload?.endpoint || "http://localhost:11434";
  if (!safeLocalEndpoint(endpoint)) throw new Error("Ollama adresi geçersiz.");
  if (!payload?.model || typeof payload.model !== "string") throw new Error("Önce bir yerel model seç.");
  const response = await fetch(new URL("/api/chat", endpoint), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: payload.model,
      stream: false,
      messages: payload.messages || [],
      options: { temperature: 0.65 }
    }),
    signal: AbortSignal.timeout(180000)
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error("Model isteği başarısız: " + response.status + " " + body.slice(0, 240));
  }
  const data = await response.json();
  return data.message?.content || "Model boş yanıt döndürdü.";
});

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
