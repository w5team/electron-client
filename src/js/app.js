/**
 *
 * Application
 *
 * 
 */

// Variáveis da Aplicação
const APP_MODULE = {
    cadastro: APP_CADASTRO,
    lancamento: APP_LANCAMENTO,
    relatorio: APP_RELATORIO,
    notificacao: APP_NOTIFICACAO
}
let APP_MODULE_ID = 'cadastro'
let APP_MODULE_PAGE = 'dashboard'

// START Application
window.onload = () => {

    // Start MENU principal da aplicação
    APP_MENU.init()
    
    // Checando login
    APP_LOGIN.init()

    // Botão de FECHAR a JANELA
    $('#topclose').on('click', () => { ipcRenderer.send('fechar') })

    // Botão de MAXIMIZAR a JANELA
    $('#topmax').on('click', () => { ipcRenderer.send('maximize') })

    // Logout
    ipcRenderer.on('logout', () => { APP_LOGIN.logout() })

    // Modal message to APP_PAGE
    ipcRenderer.on('modalMsg', function(e, a, b, c){
        if("function" == typeof APP_PAGE['modalMsg']){
            APP_PAGE.modalMsg(e, a, b, c)
        }
    })

    // AUTO UPDATE ---- teste
    ipcRenderer.on('message', (e, t) => console.log(e, t))

    // Change menu - notification
    $("#topbell").on('click', () => {
            $("#topmenu").removeClass('on')
            $("#topbell").addClass('on')
            $("#menu").fadeOut(0, () => {$("#notification").fadeIn('slow')
        })   
    })
    $("#topmenu").on('click', () => {
            $("#topmenu").addClass('on')
            $("#topbell").removeClass('on')
            $("#notification").fadeOut(0, () => {$("#menu").fadeIn('slow')
        })   
    })

    // Acendendo "blackout" & mostrando o "corpo"
    _('blackout').style.display = 'none'

    // Ouvindo o redimensionamento da tela
    document.body.onresize = () => {
        if(!APP_LOGIN.logged) {return false}

        if(document.body.offsetWidth > 800){ 
            APP_MENU.show() 
        } else { 
            APP_MENU.hide()
        }
    }

    // Abrir e fechar o menu ao clicar no logo
    _('logo').onclick = () => {
        if(!APP_LOGIN.logged) {return false}
        APP_MENU.toggle()
    }
}