const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("nova", {
  openExternal: (url) => ipcRenderer.invoke("nova:open-external", url)
});