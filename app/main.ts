import {app, BrowserWindow, ipcMain, Menu, powerMonitor, nativeImage ,screen, shell, Tray} from 'electron';
import * as path from 'path';
import * as fs from 'fs';

const activeWindow = require('active-win');
let timer: any;
let app_list: any = {}; 
let idleTime: number;
let marked_idle: number = 0;

let isQuitting = false;

// let idle_list: any = {}; 

let treshold_time: number = 15;

let win: BrowserWindow | null = null;
const args = process.argv.slice(1),
serve = args.some(val => val === '--serve');

let tray = null


function createWindow(): BrowserWindow {

  const size = screen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: 493,
    height: 730,
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

  win.on('close', (event) => {
    if (!isQuitting) {
        event.preventDefault(); // Prevent the window from actually closing
      if(win != null){
        win.hide(); // Hide the window instead
      }
    }
  });

  


  // win.on('close', function (event) {
  //   if (!isQuitting) {
  //     event.preventDefault(); // Prevent the window from actually closing
  //     if(win != null){
  //       win.hide(); // Hide the window instead
  //     }
  //   }
  // });

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

  app.on('before-quit', function () {
    isQuitting = true;
  });

  // tray
app.whenReady().then(() => {
  // Load your actual icon image here
  const icon = nativeImage.createFromPath('src/assets/images/owl.png');

  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'Open', 
      click: () => {
        console.log('Open App');
      },
      
    }, // Exit option
    { 
      label: 'Dashboard', 
      click: () => {
        console.log('Open Dashboard');
      },
      
    }, // Opens Dashboard
    {
      type: 'separator'
    },
    { 
      label: 'Exit', 
      click: () => {
        console.log('Application exited.');
        app.quit();
      },
      
    }// Exit option

  ]);

  tray.setToolTip('TaskOwl');
  tray.setContextMenu(contextMenu);

  // Add click event listener to tray icon
  tray.on('click', () => {
    if(win != null){
      if (win.isVisible()) {
        win.hide(); // Hide the window if it's visible
      } else {
        win.show(); // Show the window if it's hidden
      }
    }

  });

  // Start the interval for checking idle time
  // intervalId = setInterval(checkIdleTime, 1000);
});


  ipcMain.on('openLink', (e,value) =>{
    shell.openExternal(value);
    console.log(value);
  })
 
  ipcMain.on('start-track', async (event) => {

    let time:number = 1;
     idleTime = 0;

  

     timer = setInterval(async () => {
        try {
          const options = {}; // You need to define options object if required
          const activeWin = await activeWindow(options);
          setApps(activeWin.owner.name, time);
          console.log(app_list)

          idleTime = powerMonitor.getSystemIdleTime();


          if(idleTime >= treshold_time){
            setUserActivity();
          }
            

        } catch (error) {
          console.error('Error:', error);
        }
      }, 1000); // Execute every 1000 milliseconds (every second)

    // if user is idle
    function setUserActivity(){

        if(idleTime > treshold_time){
          marked_idle ++;
        }else if(idleTime == treshold_time){
          marked_idle += idleTime;
        }

        console.log("User is now idle: " + marked_idle)
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


    win?.webContents.send('time-track-stopped', app_list, marked_idle);
    app_list = {};
    marked_idle = 0;
  })

  ipcMain.on('pause-track', async (event,data)=>{
    clearInterval(timer);
    
  })

} catch (e) {
  // Catch Error
  // throw e;
}
