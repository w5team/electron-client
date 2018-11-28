// Controle de versão - modificar conforme a versão, para upload no usuário
const versionname = 'W5'
const versionbuild = '1811270350'
const version = '0.0.1'

// Constantes URLs do Servidor
const SERVER_URL = 'http://localhost:5000'
const SERVER_URL_RSAKEY = SERVER_URL + '/user/rsakey'
const SERVER_URL_LOGIN = SERVER_URL + '/user/login'
const SERVER_URL_LOGOUT = SERVER_URL + '/user/logout'
const SERVER_URL_PING = SERVER_URL + '/ping'

// Electron
const {remote} = require('electron')
const {Menu, MenuItem} = remote
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('config.json')
const db = low(adapter)
const shell = require('electron').shell
const {ipcRenderer} = require('electron')

// Style class CSS for REPORTs (utils.js/function report)
const ALERT = 'red'
const INFO = 'blu'
const WARN = 'ora'

// debug only - delete-me before a build...
let TMP1 = []
let TMP2 = ''
let TMP3 = ''