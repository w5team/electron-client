/*

	Notificações

 */
let APP_INFO = {

    recibo_url: SERVER_URL+'/msg/recibo',
    contador: 0,


	push: (data) => { 

        // Mostrando mensagens
        if("undefined" != typeof data['msg']){

        	$("#notification .default").remove()

        	data.msg.map((msg) => {
        		var d = new Date(msg.envio)
            	_("notification").innerHTML += '<div class="mensagem" onclick="APP_INFO.check(this, \''+msg.id+'\', \''+msg.link+'\')"><i class="check icon"></i><h3>'+msg.titulo+'</h3><p>'+msg.mensagem+'</p><span>'+d.toLocaleString()+'</span></div>'
                APP_INFO.contador ++
        	})

            // Mostrando o ícone
            APP_INFO.displayBell()

        	// Mostrando na área de notificação do Windows 10
        	var p = data.msg.length > 1 ? 's' : ''
        	ipcRenderer.send('showNotification', 'Notificações', 'Você recebeu '+data.msg.length+' nova'+p+' mensagen'+p+'!')
        	

        	
        }
	},

    check: (e, id, link) => {
        if(link != "false") { SERVER.openLink(link)}
        SERVER.send(APP_INFO.recibo_url, {id: id}, () => {
            APP_INFO.contador --
            APP_INFO.displayBell()
            e.remove()
        })
    },

    displayBell: () => {
        if(APP_INFO.contador <= 0){
            APP_INFO.contador = 0
            $("#topbell a").html('')
            $("#topbell a").hide()
            _("notification").innerHTML = '<span class="default">Você não tem novas notificações!<i class="bell slash outline icon"></i></span>'
        } else {
            $("#topbell a").html((APP_INFO.contador > 9 ? '+9' : APP_INFO.contador))
            $("#topbell a").show()
        }
    }



}