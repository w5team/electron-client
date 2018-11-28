// PROXY para transporte criptografado com o servidor 
const SERVER = {
    RSA: '',
    KEY: '',
    ID: 0,
    URL: '',
    WDOG: false,
    PING_TIMER: 0,
    LEDBLINK: false,

    init: function(token, id) {
        SERVER.KEY = token
        SERVER.ID = id

        // Starts a server WDOG to ping in server (for sincronizes)
        SERVER.WDOG = setInterval(() => {
            SERVER.watchdog()
        }, 1000)
    },

    // Interrupção à cada 1 segundo - para "acordar" funções periódicas
    watchdog: () => {

        ////console.log('[WATCH DOG]')

        // -------------------- Ping
        SERVER.PING_TIMER++

        if (SERVER.PING_TIMER == 30) {
            SERVER.PING_TIMER = 0

            // Se NÃO estiver logado, sai sem fazer nada.
            if(APP_LOGIN.logged === false) return false
            
            // Roda "ping"!
            SERVER.ping()
        }

        // --- Others counters
    },


    // Para transportar dados criptografados com o servidor
    // param = dado a ser transferido sem criptografia
    //      ex.: param ==> {base: dataBase} 
    send: function(url, data, callback, param) {
        TMP2 = data

        SERVER.led(true) // Start LED INDICATOR

        AES.size(256)
        var data = AES.enc(JSON.stringify(data), SERVER.KEY)
        var data = {
            data: data,
            id: SERVER.ID
        }

        // Para enviar dados não criptografados
        if(param){
            data['param'] = param
        }

        // Enviando via POST
        $.post(url, data).done(function(dta) {
            
            TMP = dta // To debug
            
            try {

                // Decriptando
                var dec = AES.dec(dta.data, SERVER.KEY)
                
                // Recuperando objeto JSON
                var dt  = JSON.parse(dec)

            } catch (e) {

                // Ocorrendo um erro, resulta em [false]
                dt = false
            }
         
            TMP1 = dt // To debug

            // Se a chave não conseguir decodificar, força o logout
            if (!dt) {
                setTimeout(() => {APP_LOGIN.logout(true)}, 1000)
                SERVER.led(false) // Start LED INDICATOR
                return report('Violação de segurança!<br>Para manter a segurança refaça seu LOGIN.')
            }

            // Zerando o PING
            SERVER.PING_TIMER = 0

            // Se a chave foi alterada no servidor, atualiza o local.
            if (SERVER.KEY !== dt.key) {
                SERVER.KEY = dt.key
                var user = db.get('user').value()
                user.token = dt.key
                db.set('user', user).write()
            }

            delete dt.key // Apaga a key dos dados recebidos
            SERVER.led(false) // Start LED INDICATOR

            // Retorna pelo CallBACK ou pela chamada a função (uma promisse)
            if ("function" == typeof callback) {                
                return callback(dt, dta.extra, dec)
            }            

        }).fail(function(e) {
            SERVER.led(false) // Start LED INDICATOR
            //console.log('[FAIL]:', e, data)
            report('Não consegui me comunicar com o servidor de dados!<br>Verifique a conexão de internet.')
        })
    },

    // Checa se o servidor está acessível
    ping: () => {

        SERVER.led(true) // Start LED INDICATOR

        AES.size(256)
        var data = AES.enc(JSON.stringify({
            key: SERVER.KEY,
            id: SERVER.ID,
            version: version,
            versionname: versionname,
            versionbuild: versionbuild
        }), SERVER.KEY)
        var data = {
            data: data,
            id: SERVER.ID
        }

        $.post(SERVER_URL_PING, data).done(function(dt) {

            try {
                var dt = JSON.parse(AES.dec(dt.data, SERVER.KEY))
            } catch (e) {
                dt = false
            }

            if (!dt || "undefined" == typeof dt[0] || "undefined" == typeof dt[0]['key']) {

                setTimeout(() => {APP_LOGIN.logout()}, 2000)

                SERVER.led(false) // Start LED INDICATOR
                return //console.log('[' + (new Date).toLocaleString() + '] Sincronização falhou!!')
            }

            dt = dt[0]

            // Se a chave foi alterada no servidor, atualiza o local.
            if (SERVER.KEY !== dt.key) {
                SERVER.KEY = dt.key
                var user = db.get('user').value()
                user.token = dt.key
                db.set('user', user).write()
            }

            // Para verificar as notificações ...
            APP_INFO.push(dt)

            SERVER.led(false) // Start LED INDICATOR  

        }).fail(function(e) {
            SERVER.led(false) // Start LED INDICATOR
            //console.log('[' + (new Date).getTime().toLocaleString() + '] Sincronização falhou, com erro: ', e)
        })
    },

    // Sinalização de acesso à rede
    led: function(status) {
        var status = status || false
        clearInterval(SERVER.LEDBLINK)

        if (status == false) {
            $("#topconnect").removeClass('on')
        } else {
            SERVER.LEDBLINK = setInterval(() => {
                $("#topconnect").toggleClass('on')
            }, 100)
        }
    },

    // Open external link in default browser
    openLink: function(link) {
        shell.openExternal(link)
    }
}