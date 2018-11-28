// Gerencia menu 
const APP_MENU = {

    status: 'hide',

    init: () => { 

        // Atualiza a versão do software
        $("#appinfo").html('<b>'+versionname+'</b> - build '+versionbuild+'/'+version)

        // Inicia o Accordion para o menu do Semantic-ui
        $('.ui.accordion').accordion()

        // Click no MENU
        let menu = document.querySelectorAll('#mmenu .title')
        for (var i = 0; i < menu.length; i++) {
            menu[i].onclick = (e) => {

                // Identificando o módulo
                APP_MODULE_PAGE = 'dashboard'
                APP_MODULE_ID = e.target.getAttribute('data-module')

                // Resetando o submenu dos módulos
                var s = document.querySelector('.submenu li.active')
                if ("undefined" != typeof s && null != s) s.classList.remove('active')

                // Carregando e ropdando os recursos do módulo
                APP_MODULE[APP_MODULE_ID].init()
                APP_MODULE[APP_MODULE_ID].form(APP_MODULE_PAGE)
            }
        }

        // Click no submenu
        let submenu = document.querySelectorAll('.submenu li')
        for (var i = 0; i < submenu.length; i++) {
            submenu[i].onclick = (e) => {

                // Resetando o submenu ACTIVE
                var s = document.querySelector('.submenu li.active')
                if ("undefined" != typeof s && null != s) s.classList.remove('active')

                // Ativando o submenu clicado
                e.target.classList.add('active')

                // Setando as variáveis da APP
                APP_MODULE_PAGE = e.target.getAttribute('data-page')
                APP_MODULE_ID = e.target.getAttribute('data-module')

                // Carregando módulo e form conforme seleção
                APP_MODULE[APP_MODULE_ID].init()
                APP_MODULE[APP_MODULE_ID].form(APP_MODULE_PAGE) 

                // Escondendo o menu, se necessário
                if(APP_MENU.status == 'float') APP_MENU.hide()
            }
        }
    }, 
    hide: () => { 
        _('mmenu').classList.remove('on')
        _('mmenu').classList.remove('float')
        _('body').classList.add('on')
        APP_MENU.status = 'hide'        
    },
    show: () => { 
        if(document.body.offsetWidth > 800) {
            _('mmenu').classList.add('on')
            _('mmenu').classList.remove('float')
            _('body').classList.remove('on')
            APP_MENU.status = 'show'
        } else {
            _('mmenu').classList.add('on')
            _('mmenu').classList.add('float')
            APP_MENU.status = 'float'
        }
    },
    toggle: () => { 
        if(APP_MENU.status == 'show' || APP_MENU.status == 'float'){
            APP_MENU.hide()
        } else {
            APP_MENU.show()
        }
    }
}