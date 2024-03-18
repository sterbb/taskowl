import {app, BrowserWindow, ipcMain, powerMonitor, screen, shell} from 'electron';
import * as path from 'path';
import * as fs from 'fs';

const activeWindow = require('active-win');
let timer: any;
let app_list: any = {}; 

let win: BrowserWindow | null = null;
const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');

function createWindow(): BrowserWindow {

  const size = screen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: 695,
    height: 785,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: (serve),
      contextIsolation: false,
    },
  });

  

  if (serve) {
    const debug = require('electron-debug');
    debug();

    require('electron-reloader')(module);
    win.loadURL('http://localhost:4200');
  } else {
    // Path when running electron executable
    let pathIndex = './index.html';

    if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
       // Path when running electron in local folder
      pathIndex = '../dist/index.html';
    }

    const url = new URL(path.join('file:', __dirname, pathIndex));
    win.loadURL(url.href);
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  return win;
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => setTimeout(createWindow, 400));

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

  ipcMain.on('openLink', (e,value) =>{
    shell.openExternal(value);
    console.log(value);
  })
 
  ipcMain.on('start-track', async (event) => {

    let time:number = 1;

  

     timer = setInterval(async () => {
      try {
        const options = {}; // You need to define options object if required
        const activeWin = await activeWindow(options);
        setApps(activeWin.owner.name, time);
        console.log(app_list)

         const state = powerMonitor.getSystemIdleState(1); 
          console.log('Current System State - ', state); 
          const idle = powerMonitor.getSystemIdleTime() 
          console.log('Current System Idle Time - ', idle); 

      } catch (error) {
        console.error('Error:', error);
      }
      }, 1000); // Execute every 1000 milliseconds (every second)

    function setUserActivity(){

    }
    function setApps(app_use: string | number, time_use: number){

      if(!app_list[app_use]){
        app_list[app_use] = {};
        app_list[app_use]['time'] = time_use;
     
      }else{
        time_use = app_list[app_use]['time']
        time_use++
        app_list[app_use]['time'] = time_use;
      }
      time = 1;
      
    }


  })

  ipcMain.on('stop-track', async (event,data)=>{
    clearInterval(timer);


    win?.webContents.send('apps-used', app_list);
    app_list = {};
  })

  ipcMain.on('pause-track', async (event,data)=>{
    clearInterval(timer);
    
  })

} catch (e) {
  // Catch Error
  // throw e;
}
