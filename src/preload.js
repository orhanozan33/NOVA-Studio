const {contextBridge,ipcRenderer}=require("electron");
contextBridge.exposeInMainWorld("nova",{
  getModels:()=>ipcRenderer.invoke("nova:ollama-models"),
  chat:(payload)=>ipcRenderer.invoke("nova:ollama-chat",payload),
  system:()=>ipcRenderer.invoke("nova:system"),
  chooseFiles:()=>ipcRenderer.invoke("nova:choose-files"),
  openPath:(p)=>ipcRenderer.invoke("nova:open-path",p),
  openUrl:(u)=>ipcRenderer.invoke("nova:open-url",u),
  window:(a)=>ipcRenderer.invoke("nova:window",a)
});