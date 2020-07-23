const { app, BrowserWindow, Menu, ipcMain, ipcRenderer } = require('electron')
const isDevMode = require('electron-is-dev')
const { CapacitorSplashScreen, configCapacitor } = require('@capacitor/electron')

const os = require('os')
const path = require('path')
const electron = require('@capacitor/electron')
const { platform } = require('process')

// Place holders for our windows so they don't get garbage collected.
let mainWindow = null

// Placeholder for SplashScreen ref
let splashScreen = null

// Change this if you do not wish to have a splash screen
let useSplashScreen = false

// Create simple menu for easy devtools access, and for demo
const menuTemplateDev = [
  {
    label: 'Options',
    submenu: [
      {
        label: 'Open Dev Tools',
        click() {
          mainWindow.openDevTools()
        }
      }
    ]
  }
]

async function createWindow() {
  // Define our main window size
  if (os.platform() === 'darwin') {
    mainWindow = new BrowserWindow({
      height: 600,
      width: 800,
      show: false,
      frame: true,
      titleBarStyle: 'hidden',
      webPreferences: {
        nodeIntegration: true,
        preload: path.join(__dirname, 'node_modules', '@capacitor', 'electron', 'dist', 'electron-bridge.js')
      },
      title: "Coveron"
    })
  } else {
    mainWindow = new BrowserWindow({
      height: 600,
      width: 800,
      show: false,
      frame: false,
      webPreferences: {
        nodeIntegration: true,
        preload: path.join(__dirname, 'node_modules', '@capacitor', 'electron', 'dist', 'electron-bridge.js')
      },
      icon: path.join(__dirname, 'icons', 'icon.png'),
      title: "Coveron"
    })
  }

  configCapacitor(mainWindow)

  if (isDevMode) {
    // Set our above template to the Menu Object if we are in development mode, dont want users having the devtools.
    Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplateDev))
    // If we are developers we might as well open the devtools by default.
    // mainWindow.webContents.openDevTools()
  }

  if (useSplashScreen) {
    splashScreen = new CapacitorSplashScreen(mainWindow)
    splashScreen.init()
  } else {
    mainWindow.loadURL(`file://${__dirname}/app/index.html`)
    mainWindow.webContents.on('dom-ready', () => {
      mainWindow.show()
    })
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some Electron APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// Define any IPC or other custom functionality below here
const { AnalyzerMain } = require("../dist/out-tsc/analyzer/AnalyzerMain");

let analyzer_main = null;

ipcMain.on('load_report', function (event, args) {
  console.log("Loading report from " + args['filename']);
  mainWindow.webContents.send('report_opened');
  analyzer_main = new AnalyzerMain(args['filename'], null, mainWindow);
});

ipcMain.on('close_report', function (event, args) {
  console.log("Closing report.");
  analyzer_main = null;
  mainWindow.webContents.send('report_closed');
});
