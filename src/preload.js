const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("nova", {
  window: (action) => ipcRenderer.invoke("nova:window", action),
  openExternal: (url) => ipcRenderer.invoke("nova:open-external", url),
  openPath: (target) => ipcRenderer.invoke("nova:open-path", target),
  chooseFiles: () => ipcRenderer.invoke("nova:choose-files"),
  openFile: (path) => ipcRenderer.invoke("nova:open-file", path),
  systemInfo: () => ipcRenderer.invoke("nova:system-info"),
  ollamaModels: (endpoint) => ipcRenderer.invoke("nova:ollama-models", endpoint),
  ollamaChat: (payload) => ipcRenderer.invoke("nova:ollama-chat", payload)
});