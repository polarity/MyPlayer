var electron = require('electron')
var app = electron.app
var BrowserWindow = electron.BrowserWindow
var crashReporter = process.crashReporter || electron.crashReporter
var dialog = electron.dialog
var ipcMain = electron.ipcMain
var path = require('path')

var AUDIO_FILE_REGEX = /\.(mp3|m4a|wav)$/i

// Report crashes to our server if available in this Electron version.
if (crashReporter && typeof crashReporter.start === 'function') {
  crashReporter.start({
    productName: 'MyPlayer',
    companyName: 'Scriptshit',
    submitURL: 'https://scriptshit.de/',
    autoSubmit: true
  })
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null

// path to music file to load on startup. init is false
global.loadOnStartup = false

var extractAudioPathFromArgs = function (argv) {
  for (var i = 0; i < argv.length; i++) {
    if (AUDIO_FILE_REGEX.test(argv[i])) {
      return argv[i]
    }
  }
  return false
}

var sendOpenFileToRenderer = function (filePath) {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return
  }

  if (mainWindow.webContents.isLoadingMainFrame()) {
    mainWindow.webContents.once('did-finish-load', function () {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('open-file', filePath)
      }
    })
    return
  }

  mainWindow.webContents.send('open-file', filePath)
}

var createMainPlayerWindow = function () {
  if (mainWindow && !mainWindow.isDestroyed()) {
    return mainWindow
  }

  // Create the app window
  mainWindow = new BrowserWindow({
    width: 600,
    height: 200,
    useContentSize: true,
    center: true,
    resizable: false,
    title: 'MyPlayer',
    alwaysOnTop: true,
    autoHideMenuBar: true,
    backgroundColor: '#1E1E1E',
    acceptFirstMouse: true,
    frame: true,
    webPreferences: {
      // Keep legacy renderer code working without a larger refactor.
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'))
  if (typeof mainWindow.removeMenu === 'function') {
    mainWindow.removeMenu()
  }

  // Open the devtools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  return mainWindow
}

if (process.platform === 'win32') {
  // path to music file to load when user starts the app with a file (Windows only)
  global.loadOnStartup = extractAudioPathFromArgs(process.argv.slice(1))
}

// Windows/Linux: only one single app instance possible.
var hasSingleInstanceLock = app.requestSingleInstanceLock()
if (!hasSingleInstanceLock) {
  app.quit()
} else {
  app.on('second-instance', function (event, commandLine) {
    var secondInstanceFile = extractAudioPathFromArgs(commandLine.slice(1))
    if (secondInstanceFile) {
      global.loadOnStartup = secondInstanceFile
      sendOpenFileToRenderer(secondInstanceFile)
    }

    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore()
      }
      mainWindow.focus()
    } else if (app.isReady()) {
      createMainPlayerWindow()
    }
  })

  // This method will be called when Electron has done everything
  // initialization and ready for creating browser windows.
  app.whenReady().then(function () {
    createMainPlayerWindow()
  })
}

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  app.quit()
})

/**
 * Event: User OS wants to use the application to open a file (macOS)
 */
app.on('open-file', function (event, filePath) {
  event.preventDefault()

  // path to music file to load
  // user opens the app with a file
  global.loadOnStartup = filePath

  // app runs, but no windows open
  if (!mainWindow && app.isReady()) {
    createMainPlayerWindow()
  }
  if (mainWindow && app.isReady()) {
    sendOpenFileToRenderer(filePath)
  }
})

// Re-create window when app icon is clicked and no windows are open (macOS).
app.on('activate', function () {
  if (!mainWindow) {
    createMainPlayerWindow()
  }
})

ipcMain.handle('open-file-dialog', async function () {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return false
  }

  var result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{
      name: 'Audio',
      extensions: ['mp3', 'm4a', 'wav']
    }]
  })

  if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
    return false
  }

  return result.filePaths[0]
})

ipcMain.handle('get-load-on-startup', function () {
  return global.loadOnStartup || false
})
