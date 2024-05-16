import {app, BrowserWindow, ipcMain, Menu, powerMonitor, nativeImage ,screen, shell, Tray, Notification} from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as fs from 'fs';

import { Buffer } from 'node:buffer';


const activeWindow = require('active-win');
const screenshot = require('screenshot-desktop');
const io = require("socket.io-client")
const socket = io("http://localhost:3000");

let timer: any;
let app_list: any = {}; 
let idleTime: number;
let marked_idle: number = 0;
let current_idle: any = {};
let idle_data: any = [];
let start_idle: any = '';

let isQuitting = false;

// let idle_list: any = {}; 

let treshold_time: number = 5;

let win: BrowserWindow | null = null;
let widgetWindow: BrowserWindow | null = null;
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
    // resizable: false,
    autoHideMenuBar: true,
    movable: true,
    frame: false, // Remove frame to make it look like a widget
    transparent: true, // Make the background transparent
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

    win.loadURL(url.href + '#/widget');
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

  win.on('minimize', () =>{


    // win?.setFullScreen(true); // Restore the window if it's minimized
    win?.setBounds({
      x: 100, // X-coordinate
      y: 100, // Y-coordinate
      width: 335, // Width
      height: 110 // Height
    })

    win?.setAlwaysOnTop(true); // Make the window always on top

    win?.webContents.insertCSS(`
    body {
      background-color: transparent !important;
    }
  `);

    win?.webContents.send('widget', 'open');
    

  
    // // Now proceed to resize and adjust other properties
    // win.setSize(335, 110); // Resize the window

  })

  


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

  function getGreeting() {
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
  
    if (currentHour < 12) {
      return 'Good morning';
    } else if (currentHour < 18) {
      return 'Good afternoon';
    } else {
      return 'Good evening';
    }
  }
  
  function showNotification () {
    let greeting = getGreeting();
    const NOTIFICATION_TITLE = 'TaskOwl';
    const NOTIFICATION_BODY = greeting + "User!";
    new Notification({ title: NOTIFICATION_TITLE, body: NOTIFICATION_BODY}).show();
  }

  showNotification();

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
          }else if(idleTime == 0 && start_idle != ''){
            setUserActivity();
          }

          console.log(powerMonitor.getSystemIdleState(1))

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

        if(powerMonitor.getSystemIdleState(1) == 'idle'){
          if(start_idle == ''){
            start_idle = Math.floor(Date.now() / 1000);
            current_idle['start_time'] = start_idle;
          }
        }else if(powerMonitor.getSystemIdleState(1) == 'active'){
          current_idle['end_time'] = Math.floor(Date.now() / 1000);
          current_idle['total_time'] = marked_idle;
 
          idle_data.push(current_idle);
          console.log(current_idle);

          marked_idle = 0;
          start_idle = '';
          current_idle = {};
          
  
        }
        console.log(start_idle);
        console.log(idle_data);

        






        
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


    win?.webContents.send('time-track-stopped', app_list, idle_data);
    app_list = {};
    marked_idle = 0;
    current_idle = {};
    idle_data = [];
    start_idle = '';
  })

  ipcMain.on('pause-track', async (event,data)=>{
    clearInterval(timer);
    
  })

  ipcMain.on('close', async (event,data)=>{
    win?.hide(); // Hide the window instead
    
  })

  socket.on('adminMessage', function(data:any) {
    console.log(`Admin: ${data.message}`);
  });

  ipcMain.on('minimize', async (event,data)=>{

    if(data == "open-widget"){
    // win?.setFullScreen(true); // Restore the window if it's minimized
    win?.setBounds({
      x: 100, // X-coordinate
      y: 100, // Y-coordinate
      width: 335, // Width
      height: 110 // Height
    })



    win?.webContents.insertCSS(`
    body {
      background-color: transparent !important;
    }
  `);

    win?.webContents.send('widget', 'open');

    win?.setAlwaysOnTop(true); // Make the window always on top
    


    }else{
      win?.setBounds({
        x: 100, // X-coordinate
        y: 100, // Y-coordinate
        width: 493,
        height: 730,
      })
  

  
      win?.webContents.insertCSS(`
        body {
          background-color: white !important;
        }
      `);
  
      win?.webContents.send('main', 'open');

      win?.setAlwaysOnTop(true); // Make the window always on top
      
  
    }

    
  })

  socket.on("capture", function(data:any){
    screenshot().then((img: any) => {
      var imgStr = img.toString('base64');

      socket.emit('clientScreenshot', {imgStr})
      console.log(imgStr);
      // win?.webContents.send('screenshot', imgStr);
    }).catch((err: any) => {
      // ...
    })
    
  })

  // ipcMain.on('capture', async (event)=>{
  //   screenshot().then((img: any) => {
  //     var imgStr = img.toString('base64');

  //     console.log(imgStr);
  //     // win?.webContents.send('screenshot', imgStr);
  //   }).catch((err: any) => {
  //     // ...
  //   })
  // })

} catch (e) {
  // Catch Error
  // throw e;
}
