/*
    W5CEmp

    Copyright (c) 2018, WebCinco.com.br
    Developer: Bill Rocha <prbr@ymail.com> | billrocha

 */
const {
    app,
    BrowserWindow,
    ipcMain,
    Menu,
    Tray
} = require('electron')
const Shell = require('electron').shell

// Site da Aplicação
const AppLink = 'https://azw5.com/w5cemp'

// Variáveis de referencia
let win, child
let updateTimer
let maximized = false
let appIcon
app.isQuiting = true

// UPDATE
const {autoUpdater} = require("electron-updater")

// Simgle instance
if (!app.requestSingleInstanceLock()) app.quit()
app.on('second-instance', () => {
    if (win) {
        if (win.isMinimized()) win.restore()
        win.show()
        win.focus()
    }
})

// Aplicação pronta: monta a janela principal.
app.on('ready', () => {
    appWindow()

    // Checa por update na inicialização do aplicativo
    autoUpdater.checkForUpdatesAndNotify()

    // Checa por update a cada 3 minutos (60s * 3 * 1000 = 180.000) - 10 minutos em produção (600.000)
    updateTimer = setInterval( () => {
        autoUpdater.checkForUpdatesAndNotify()
        sendStatusToWindow('checkUpdate - 3 minutos')
    }, 180000)
})

// Finaliza quando todas as janelas estiverem fechadas.
app.on('window-all-closed', () => {
    // Para NÃO MacOs 
    if (process.platform !== 'darwin') {
        if (appIcon) appIcon.destroy()
        app.quit()
    }
})

// Quando a aplicação é "ativada" (novamente?)
app.on('activate', () => {
    // Para MacOs
    if (win === null) appWindow()
})


// JumpList do windows
app.setUserTasks([
    {
        program: 'https://azw5.com/w5CEmp',
        arguments: '',
        iconPath: process.execPath,
        iconIndex: 1,
        title: 'Site da Aplicação',
        description: 'Abrir o site da Aplicação'
    },
    {
        program: 'http://azw5.com/download',
        arguments: '',
        iconPath: process.execPath,
        iconIndex: 1,
        title: 'Downloads',
        description: 'Abrir navegador na página de Downloads'
    },
    {
        program: process.execPath,
        arguments: '--shutdown',
        iconPath: __dirname + '/img/tray/x.png',
        iconIndex: 1,
        title: 'Sair (fechar)',
        description: 'Fechar e sair da aplicação'
    }
])

// -------------------------------------------- IPC Center -------------------------------

// Carrega uma página na janela principal
ipcMain.on('loadPage', (event, url) => win.loadURL(url))

// Carrega link em navegador externo
ipcMain.on('openLink', (link) => Shell.openExternal(link))

// Minimizar a tela
ipcMain.on('fechar', () => {
    app.isQuiting = false
    app.quit()
})

// Maximizar a tela
ipcMain.on('maximize', () => {
    if (maximized) {
        maximized = false
        win.restore()
    } else {
        maximized = true
        win.maximize()
    }
})

// Fechar aplicação - mesmo
ipcMain.on('appquit', () => {
    app.isQuiting = true
    if (appIcon) appIcon.destroy()
    app.quit()
})

// Para criar um canal entre janelas com a janela principal (usado em relatórios)
ipcMain.on('appCommandPage', (e, a, b, c) => win.webContents.send('modalMsg', e, a, b, c))

// Enviando mensagem para a área de notificação
ipcMain.on('showNotification', (e, titulo, mensagem) => showNotification(titulo, mensagem))

/* Barra de progresso
  exemplo: ipcRenderer.send('progressBar', valor)  
  --> valor de 0 a 1
  --> -1 desabilita a barra
  --> 2 (maior que 1) coloca em modo "indefinido" (fica apulsando)
*/
ipcMain.on('progressBar', (e, value) =>  win.setProgressBar(value))





// ---- TESTE ---- DELETAR ----------------------------------------------------- [BEGIN]
    
ipcMain.on('closeModal', () => child.hide())

ipcMain.on('teste', (e, a, b, c) => {
    win.setOverlayIcon(__dirname + '/img/tray/on.png', 'Description for overlay')

    win.flashFrame(true)
    // Thumbnails
    win.setThumbarButtons([
    {
        tooltip: 'button1',
        icon: __dirname + '/img/tray/l.png',
        click () { console.log('button1 clicked') }
    }, {
        tooltip: 'button2',
        icon: __dirname + '/img/tray/l.png',
        flags: ['enabled', 'dismissonclick'],
        click () { console.log('button2 clicked.') }
    }])

    e.returnValue = __dirname + '/img/tray/on.png'
})


// ---- TESTE ---- DELETAR ----------------------------------------------------- [END]





// Janela do processo renderizado principal (WebCinco Browser - W5B) ---------------------
function appWindow() 
{
    // Criar uma janela de navegação,
    win = new BrowserWindow({
        width: 960, //1200,
        minWidth: 580,

        height: 720,
        minHeight: 670,

        x: 10,
        y: 150,

        show: true,
        icon: 'img/icon.png',

        backgroundColor: '#8C0000',
        frame: false,
        webPreferences: {nativeWindowOpen: true}
    })

    // esconde o menu 
    win.setMenu(null)

    // e carrega index.html do app.
    win.loadURL(__dirname + '/index.html')

    // Mostra a janela
    win.on('ready-to-show', () => win.show())

    // Abre o DevTools.
    win.webContents.openDevTools()

    // Para abrir janelas como no Chrome
    win.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {

        // Para abrir no centro da tela
        delete options.x 
        delete options.y

        if (frameName !== '') {
            // open window as modal
            event.preventDefault()
            Object.assign(options, {
                parent: win,
                modal: true,
                frame: true,
                backgroundColor: '#FFF',
                minimizable: false,
                title: frameName
            })
            event.newGuest = new BrowserWindow(options)
            event.newGuest.setMenu(null)
        }
    })

    // ao minimizar, vai para o TRAY
    win.on('minimize', (event) => {
        event.preventDefault()
        win.hide()
    })

    win.on('maximize', () => maximized = true)
    win.on('unmaximize', () => maximized = false)

    // Ao fechar a janela ...
    win.on('close', (event) => {
        if (!app.isQuiting) {
            event.preventDefault()
            win.hide()
        }
        return false
    })    

    // Emitido quando a janela é fechada.
    win.on('closed', () => win = null)

    // Janela obteve foco
    win.once('focus', () => win.flashFrame(false))
    win.flashFrame(true)

    // Systray highlight
    win.on('show', () => appIcon.setHighlightMode('always'))
    win.on('hide', () => appIcon.setHighlightMode('never'))



    // TESTE ---------------------------------------------------------- BEGIN
    // child = new BrowserWindow({
    //     parent: win, 
    //     show: true,
    //     alwaysOnTop : true,

    //     width: 450, //1200,
    //     height: 350,

    //     icon: 'img/icon.png',

    //     backgroundColor: '#D84315',
    //     frame: false
    // })
    // child.loadURL(__dirname + '/modal.html')
    // child.once('ready-to-show', () => child.show())
    // child.webContents.openDevTools()


    // TESTE ---------------------------------------------------------- END


    // Restore from tray...
    appIcon = null
    appIcon = new Tray(__dirname + '/img/tray/icon32.png')

    var contextMenu = Menu.buildFromTemplate([{
        label: 'Abrir W5CEmp',
        icon: __dirname + '/img/tray/icon32m.png',
        click: () => win.show()
    }, {
        label: 'Site da Aplicação',
        icon: __dirname + '/img/tray/h.png',
        click: () => Shell.openExternal(AppLink)
    }, {
        label: 'W5Chat (status)',
        icon: __dirname + '/img/tray/a.png',
        title: 'Status de visualização do usuário',
        type: 'submenu',
        submenu: [
            {
                label: 'Ativo',
                icon: __dirname + '/img/tray/on.png',
                enabled: true,
                click: () => showNotification('Status do W5Chat',"O chat está desativado nessa versão!")
            },{
                label: 'Ocupado',
                icon: __dirname + '/img/tray/no.png',
                enabled: true,
                click: () => showNotification('Status do W5Chat','O chat está desativado nessa versão!')
            },{
                type: 'separator'
            },{
                label: 'Desativado',
                icon: __dirname + '/img/tray/off.png',
                enabled: true,
                click: () => showNotification('Status do W5Chat','O chat está desativado nessa versão!')
            }
        ]
    }, {
        type: 'separator'
    }, {
        label: 'Desconectar (logout)',
        icon: __dirname + '/img/tray/l.png',
        click: () => {
            win.webContents.send('logout', true)
            win.show()
        }
    }, {
        type: 'separator'
    }, {
        label: 'Sair (fechar)',
        icon: __dirname + '/img/tray/x.png',
        click: () => {
            app.isQuiting = true
            app.exit()
        }
    }])

    appIcon.setToolTip('W5CEmp')
    appIcon.setContextMenu(contextMenu)
    appIcon.on('click', () => win.show())
    appIcon.on('balloon-click', () => win.show())
}


function showNotification(titulo, mensagem){
    var titulo = titulo || 'W5CEmp'
    var mensagem = mensagem || 'Hello Word!'

    if(appIcon != null){
        appIcon.setImage(__dirname + '/img/tray/icon32.png')

        appIcon.displayBalloon({
            icon: __dirname + '/img/tray/icon32.png',
            title: titulo, 
            content: mensagem 
        })
    }
}


function sendStatusToWindow(text) {
    win.webContents.send('message', text)
}


// ---------------------------------------------- AUTOUPDATE ----------------------
// Precisa ser definida a ação correta para notificar e receber autorização do usuário para fazer o UPDATE

autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('Checking for update...')
})
autoUpdater.on('update-available', (info) => {
    sendStatusToWindow('Update available.')
    showNotification('Nova Versão Disponível!', 'Notificarei quando estiver pronta para ser instalada.')
})
autoUpdater.on('update-not-available', (info) => {
    sendStatusToWindow('Update not available.')
})
autoUpdater.on('error', (err) => {
    sendStatusToWindow('Error in auto-updater. ' + err)
})
autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%'
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')'
    sendStatusToWindow(log_message)

    sendStatusToWindow(parseFloat(progressObj.percent/100))
    win.setProgressBar(parseFloat(progressObj.percent/100))
})
autoUpdater.on('update-downloaded', (info) => {
    sendStatusToWindow('Update downloaded')
    win.setProgressBar(-1)

    showNotification('Pronto para Atualização?!', 'Vou reiniciar e instalar a nova versão agora.')
    setTimeout( () => autoUpdater.quitAndInstall(), 10000)
})