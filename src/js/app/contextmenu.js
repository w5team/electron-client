window.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    // var contextMenu = Menu.getApplicationMenu().items.filter(function(item){
    //   return item.label == "Edit"
    // })[0].submenu

    const contextMenu = Menu.buildFromTemplate([{
        label: 'Desfazer',
        role: 'undo',
    }, {
        label: 'Refazer',
        role: 'redo',
    }, {
        type: 'separator',
    }, {
        label: 'Cortar',
        role: 'cut',
    }, {
        label: 'Copiar',
        role: 'copy',
    }, {
        label: 'Colar',
        role: 'paste',
    }, {
        type: 'separator',
    }, {
        label: 'Selecionar tudo',
        role: 'selectall',
    },
    ])
    
    let node = e.target

    while (node) {
        if (node.nodeName.match(/^(input|textarea)$/i) || node.isContentEditable) {
            contextMenu.popup(remote.getCurrentWindow())
            break
        }
        node = node.parentNode
    }

}, false)