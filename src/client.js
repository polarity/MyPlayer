var remote = require('electron').remote
var fs = require('fs')
var _ = require('lodash')
var pathHelper = require('path')
var dialog = require('electron').remote.dialog
var ipc = require('electron').ipcRenderer
var playlist = []
var playlistPosition = false
var currentFile = false
var recursiveSync = require('recursive-readdir-sync')
var id3 = require('id3js')
var playAfterLoad = true
var SKIP_RANDOM = true // skip to random index/track

/**
 * get a random int
 */
function getRandom (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

/**
 * Converts a buffer into an ArrayBuffer
 * needed to convert read files to blobs
 * for WaveSurfer
 *
 * @author Robert Agthe <robert@scriptshit.de
 * @param  {string} buffer string of binary data
 * @return {array} Array Buffer
 */
function toArrayBuffer (buffer) {
  var ab = new ArrayBuffer(buffer.length)
  var view = new Uint8Array(ab)
  for (var i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i]
  }
  return ab
}

/**
 * Load binary from the filesystem and send it
 * to generate a blob.
 *
 * @author Robert Agthe <robert@scriptshit.de
 * @param  {[type]} file [description]
 * @return {[type]}      [description]
 */
var loadBinary = function (file) {
  var binary = fs.readFileSync(file)
  return new Blob([toArrayBuffer(binary)])
}

/**
 * User submits a mp3, we search for more
 * mp3s in this directory to have a nice play
 * list!
 * @author Robert Agthe <robert@scriptshit.de
 * @return {[type]} [description]
 */
var searchForMoreMP3inThisDir = function (path) {
// get the path to the parent dir of this file path
  var parentPath = pathHelper.dirname(path)
// read this dir and all sub-dirs
  var files = recursiveSync(parentPath)
// filter: only audio files we can listen to
  var audioFiles = _.filter(files, function (n) {
    return /(?:\.mp3$)|(?:\.wav$)|(?:\.m4a$)/.test(n)
  })
  return {
    filteredDir: audioFiles,
    path: parentPath
  }
}

/**
 * Creates one hell of a playlist.
 * discovers new tracks by traversing
 * directories recursive
 *
 * @author Robert Agthe <robert@scriptshit.de
 * @param  {string} path [audio file path]
 */
var createPlaylist = function (path) {
// remember playlist src dir
  window.localStorage.setItem('lastDir', path)

  var music = searchForMoreMP3inThisDir(path)
  playlist = []

  _.each(music.filteredDir, function (file) {
    playlist.push(file)
  })

  playlistPosition = _.findIndex(playlist, function (file) {
    return currentFile == file
  })

  console.log(
    'Playlist created!',
    playlist,
    playlistPosition,
    currentFile
  )
}

// Init Wavesurfer
var wavesurfer = Object.create(WaveSurfer)
wavesurfer.init({
  container: '#wave',
  waveColor: '#424242',
  progressColor: '#999',
  cursorColor: '#F82A71',
  barWidth: '2',
  height: document.getElementById('wave').clientHeight
})

/**
 * Event: Wavesurfer loaded a new track and is
 * ready to play... start play the song!
 *
 * @author Robert Agthe <robert@scriptshit.de
 */
wavesurfer.on('ready', function () {
  elPos = document.querySelector('.display_length')
  elPos.textContent = (wavesurfer.getDuration() / 60).toFixed(2).replace('.', ':')
  if (playAfterLoad) {
    wavesurfer.play()
  } else {
    playAfterLoad = true
  }
})

wavesurfer.on('finish', function () {
  if (playlist && playlist.length > 0) {
    skip()
  }
})

/**
 * Event: User OS wants to use the application to open a file
 * @author Robert Agthe <robert@scriptshit.de
 * @param  {[type]} event [description]
 * @return {[type]} [description]
 */
ipc.on('open-file', function (path) {
  // create a playlist from the parent dir
  createPlaylist(path)
  // load file, and play
  loadtune(path)
})

/**
 * Events for the UI
 * @author Robert Agthe <robert@scriptshit.de
 */

/**
 * Event: User wants to open a new file,
 * clicked on the "open file" icon!
 * @author Robert Agthe <robert@scriptshit.de
 */
var openfile = function () {
  dialog.showOpenDialog({
    filters: [{
      name: 'Audio',
      extensions: ['mp3', 'm4a', 'wav']
    }]
  },
function (fileNames) {
  if (fileNames === undefined) return
  // create a playlist from the parent dir
  createPlaylist(fileNames[0])
  // load this tune, and play
  loadtune(fileNames[0])
})
}

/**
 * Event: Play Pause Button pressed
 * User wants to stop the song at the current position
 * or continue playing
 *
 * @author Robert Agthe <robert@scriptshit.de
 */
var playpause = function () {
  wavesurfer.playPause()
}

/**
 * Event: Replay button pressed
 * User wants to start playing from the beginning
 *
 * @author Robert Agthe <robert@scriptshit.de
 */
var replay = function () {
  wavesurfer.play(0)
}

/**
 * skips one tune forward inside
 * the playlist
 *
 * @author Robert Agthe <robert@scriptshit.de
 */
var skip = function () {
  if (SKIP_RANDOM) {
    playlistPosition = getRandom(0, (playlist.length - 1))
  } else {
    playlistPosition++
    if ((playlistPosition + 1) > (playlist.length - 1)) {
      playlistPosition = 0
    }
  }
  var newMusicFilePath = playlist[playlistPosition]
  // dont create a playlist, just play the next tune
  loadtune(newMusicFilePath)
}

/**
 * skips one tune back in the current
 * playlist
 *
 * @author Robert Agthe <robert@scriptshit.de
 */
var back = function () {
  playlistPosition--
  if ((playlistPosition - 1) < 0) {
    playlistPosition = (playlist.length - 1)
  }
  var newMusicFilePath = playlist[playlistPosition]
  // dont create a playlist, just play the next tune
  loadtune(newMusicFilePath)
}

/**
 * loads one tune and plays it
 *
 * @author Robert Agthe <robert@scriptshit.de
 * @param  {string} file path to an audio file
 */
var loadtune = function (file, wait) {
  // remember globally file
  currentFile = file
  // read id3 Tag from current loading tune!
  currentId3 = id3({
    file: currentFile,
    type: id3.OPEN_LOCAL
  }, function (err, tags) {
    // ui update
    var elMetatags = document.querySelector('.metatags')
    // display only available tags
    if (tags.artist && tags.artist !== '') {
      elMetatags.textContent = tags.artist + ' - ' + tags.title
    } else {
      elMetatags.textContent = tags.title
    }
  })

  // display filename and path
  var elFileinfo = document.querySelector('.fileinfo .path')
  var filename = currentFile.substr(-40)
  elFileinfo.textContent = '... ' + filename

  // load blob
  // wavesurfer.load("file:///"+file);
  wavesurfer.loadBlob(loadBinary(currentFile))

  // dont play after load
  if (wait) {
    playAfterLoad = false
  }
}

/**
 * Update constantly the current play position
 * @author Robert Agthe <robert@scriptshit.de
 */
setInterval(function () {
  var currentTime = wavesurfer.getCurrentTime()
  var elPos = document.querySelector('.display_pos')
  elPos.textContent = (currentTime / 60).toFixed(2).replace('.', ':')
}, 100)

// init 0 length / no tune loaded
var elLen = document.querySelector('.display_length')
elLen.textContent = '0:00'

/**
 * Define Drag & Drop Events
 */
var holder = document.querySelector('body')

holder.ondragover = function () {
  return false
}

holder.ondragleave = holder.ondragend = function () {
  return false
}

holder.ondrop = function (e) {
  e.preventDefault()
  var file = e.dataTransfer.files[0]

  // create a playlist from the parent dir
  // of the dropped track
  createPlaylist(file.path)

  // play the dropped track
  loadtune(file.path)
  return false
}

// event listeners
document.querySelector('body').addEventListener('keydown', function (event) {
  if (event.keyCode === 32) {
    // spacebar pressed - play/pause
    playpause()
  }
})

// Load on startup...
// path to music file to load
// user opens the app with a file
// get the path to the file from the backend
// remote process ...
var loadOnStartup = remote.getGlobal('loadOnStartup') || localStorage.getItem('lastDir') || false

if (loadOnStartup) {
  // create a playlist from the parent dir
  createPlaylist(loadOnStartup)
  // load file, and play
  loadtune(loadOnStartup, true)
}
