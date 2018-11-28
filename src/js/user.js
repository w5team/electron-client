// Login ...
const APP_LOGIN = {

    logged: false, 

    securityUrl: 'html/security.html',

    init: () => {

        // Pegando a configuração de usuário do sistema
        var user = db.get('user').value()

        if("undefined" == typeof user){
            user = {
                    "auto": true,
                    "id": 0,
                    "life": 0,
                    "name": "",
                    "token": "",
                    "datein": 0,
                    "logged": false
                }
            db.set('user', user).write()
        }

        // Verificando se está logado.
        if(user.id == 0 || user.token == '' || user.logged == false || (new Date(user.life)) < (new Date) ){
            APP_LOGIN.logout()            
        } else {
            // Roda a aplicação
            APP_LOGIN.startApp()
        }
    },

    logout: function(quiet){
        var quiet = quiet || false

        APP_LOGIN.logged = false

        // Logout no servidor
        if(quiet === false){
            SERVER.send(SERVER_URL_LOGOUT, {id: db.get('user').value().id, log: 'logout'})
        }

        // Apaga a configuração
        db.set('user', {
                auto: true,
                id: 0,
                life: 0,
                name: "",
                token: "",
                datein: 0,
                logged: false
            }).write()

        // Carrega a tela de segurança
        $.get(APP_LOGIN.securityUrl).done(function(html){

            $("#body").html(html)
            $("title").html('Controle de Empresa :: Login')
            $("#toptitle").html('')
            $("#loginsobre").html('<b>'+versionname+'</b> - build '+versionbuild+'/'+version)

            APP_MENU.hide() // esconde o menu

            // Escutando o botão de login
            $('#formlogin').on('submit', function(e){
                e.preventDefault()
                $("#btlogin").addClass('loading')

                // Call login...
                APP_LOGIN.login()
            })

            document.body.style.display = 'block'
        })
    },

    startApp: () => {

        // Status
        APP_LOGIN.logged = true
        
        // Inicializa SERVER (configuração armazenada no 'user')
        var u = db.get('user').value()
        SERVER.init(u.token, u.id)        

        // Carrega página inicial do módulo ...
        APP_MODULE[APP_MODULE_ID].init()
        APP_MODULE[APP_MODULE_ID].form()

        document.body.style.display = 'block'

        // Show menu ...
        APP_MENU.show()
    },

    // Checa o login e senha e obtem o TOKEN para comunicações posteriores
    login: () => {

        // Obtendo a chave publica do servidor
        $.get(SERVER_URL_RSAKEY).done(function(data) {

            if ("undefined" != data.key) {
                SERVER.RSA = data.key
            
                // Gerando uma chave aleatória para AES
                SERVER.KEY = rpass(20)

                var loginData = JSON.stringify({
                    login: $("#login").val(),
                    passw: $("#passw").val(),
                    token: SERVER.KEY
                })

                // Criptografando com RSA
                var cripto = RSA.encrypt(loginData, RSA.getPublicKey(SERVER.RSA))

                // Checando login x senha
                $.post(SERVER_URL_LOGIN, {
                        data: cripto
                    })
                    .done(function(data) {

                        if ("undefined" != typeof data.error) {
                            if (data.error == true) {
                                $("#btlogin").removeClass('loading')
                                return report('Seu login ou senha estão incorretos!', ALERT)
                            }

                            // decriptando
                            AES.size(256)
                            var dt = AES.dec(data.data, SERVER.KEY)

                            if (!dt) {
                                $("#btlogin").removeClass('loading')
                                return report('Seu login ou senha estão incorretos!', ALERT)
                            }

                            // decodificando string para json
                            var user = JSON.parse(dt)

                            // Salvando "auto login"
                            //user.auto = _('autologin').checked

                            // Salvar login
                            user.datein = (new Date).getTime()
                            user.logged = true

                            db.set('user', user).write()

                            // Roda a aplicação
                            APP_LOGIN.startApp()

                        } else {
                            $("#btlogin").removeClass('loading')
                            return report('Não consegui me conectar com o servidor!<br>Verifique se está conectado à internet.', ALERT)
                        }
                    })
                    .fail(function(e) {
                        $("#btlogin").removeClass('loading')
                        report('Não consegui me conectar com o servidor!<br>Verifique se está conectado à internet.', ALERT)
                    })

            } else {
                $("#btlogin").removeClass('loading')
                report('Algo inexperado ocorreu e não pude carregar a chave do servidor.<br>Verifique sua conexão de internet.', ALERT)
            }

        }).fail(() => {
            $("#btlogin").removeClass('loading')
            report('Algo inexperado ocorreu e não pude me conectar ao servidor.', ALERT)
        })        
    }
}