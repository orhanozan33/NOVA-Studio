const { app, BrowserWindow, shell, ipcMain, dialog } = require("electron");
const os = require("node:os");
const path = require("node:path");
let win;
let previousCpu = os.cpus();
function cpuLoad() {
  const now = os.cpus();
  let idle=0,total=0;
  for(let i=0;i<now.length;i++){
    const a=previousCpu[i].times,b=now[i].times;
    const d={user:b.user-a.user,nice:b.nice-a.nice,sys:b.sys-a.sys,idle:b.idle-a.idle,irq:b.irq-a.irq};
    idle+=d.idle; total+=d.user+d.nice+d.sys+d.idle+d.irq;
  }
  previousCpu=now;
  return total ? Math.max(0,Math.min(100,Math.round(100*(1-idle/total)))) : 0;
}
function createWindow(){
  win=new BrowserWindow({
    width:1600,height:1000,minWidth:1120,minHeight:720,
    title:"NOVA",backgroundColor:"#080719",frame:false,fullscreen:true,
    autoHideMenuBar:true,
    webPreferences:{preload:path.join(__dirname,"preload.js"),contextIsolation:true,nodeIntegration:false,sandbox:true}
  });
  win.loadFile(path.join(__dirname,"index.html"));
  win.on("closed",()=>{win=null;});
}
app.whenReady().then(()=>{
  ipcMain.handle("nova:ollama-models",async()=>{
    try{const r=await fetch("http://127.0.0.1:11434/api/tags");if(!r.ok)throw Error("Ollama yanıt vermedi");return {ok:true,...await r.json()};}
    catch(e){return {ok:false,error:e.message};}
  });
  ipcMain.handle("nova:ollama-chat",async(_e,{model,messages})=>{
    if(typeof model!=="string"||!Array.isArray(messages))return {ok:false,error:"Geçersiz istek"};
    try{
      const r=await fetch("http://127.0.0.1:11434/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model,stream:false,messages:messages.slice(-24)})});
      if(!r.ok)throw Error("Model isteği başarısız: "+r.status);
      const data=await r.json();return {ok:true,message:data.message,done:true};
    }catch(e){return {ok:false,error:e.message};}
  });
  ipcMain.handle("nova:system",()=>({cpu:cpuLoad(),memoryUsed:Math.round((1-os.freemem()/os.totalmem())*100),memoryTotal:os.totalmem(),memoryFree:os.freemem(),platform:process.arch,os:os.macOSVersion||os.release(),hostname:os.hostname(),uptime:os.uptime()}));
  ipcMain.handle("nova:choose-files",async()=>{const r=await dialog.showOpenDialog(win,{properties:["openFile","openDirectory","multiSelections"]});return r.canceled?[]:r.filePaths;});
  ipcMain.handle("nova:open-path",async(_e,p)=>{if(typeof p!=="string")return "Geçersiz yol";return shell.openPath(p);});
  ipcMain.handle("nova:open-url",async(_e,u)=>{try{const x=new URL(u);if(!["https:","http:"].includes(x.protocol))return false;await shell.openExternal(x.toString());return true;}catch{return false;}});
  ipcMain.handle("nova:window",(_e,action)=>{if(!win)return;if(action==="minimize")win.minimize();if(action==="maximize")win.isMaximized()?win.unmaximize():win.maximize();if(action==="fullscreen")win.setFullScreen(!win.isFullScreen());});
  createWindow();
  app.on("activate",()=>{if(BrowserWindow.getAllWindows().length===0)createWindow();});
});
app.on("window-all-closed",()=>{if(process.platform!=="darwin")app.quit();});