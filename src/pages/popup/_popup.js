class TokenSend {
    symbol
    pk
}

class SendTokenWidget {
    windowManager

    setWindowManager(windowManager) {
        this.windowManager = windowManager
    }

    widget

    getWidget() {
        return this.widget
    }

    tokenLabel
    sendButton
    sendAmountInput
    destinationInput
    closeButton

    pk

    async show(tokenSend) {
        this.tokenLabel.textContent = tokenSend.symbol
        this.pk = tokenSend.pk
        this.sendButton.onclick = async() => {
            let token = new Token()
            try {
                await token.sendToken(this.pk, tokenSend.symbol, this.sendAmountInput.value, this.destinationInput.value)
                alert("Tokens sent")
                this.windowManager.send("balance", "refresh")
                this.close()
            } catch (err) {
                alert("Error sending token:" + err)
            }
        }
        this.closeButton.onclick = () => {
            this.close()
        }
    }

    close() {
        this.windowManager.showMain()
    }
}

function initSendTokenWidget(windowManager) {
    let stW = new SendTokenWidget()
    stW.windowManager = windowManager
    stW.tokenLabel = document.getElementById('send-token-widget-tokenname')
    stW.widget = document.getElementById("send-token-widget")
    stW.sendButton = document.getElementById("send-token-widget-confirm")
    stW.sendAmountInput = document.getElementById("send-token-widget-input")
    stW.destinationInput = document.getElementById('send-token-widget-destination')
    stW.closeButton = document.getElementById('send-token-widget-close')
    return stW
}

function fnCopyText(text, id) {
  navigator.clipboard.writeText(text);

  document.getElementById(id).innerHTML = "<i class='icon icon-checked'></i>";
  setTimeout(function () {
    document.getElementById(id).innerHTML = "<i class='icon icon-copy1'></i>";
  }, 1000);
}


class WindowManager {
    viewPort

    // "main" widget
    balanceWidget
    commandWidget

    //other widgets
    widgetMap = new Map()

    showMain() {
        this.viewPort.innerHTML = ''
        this.viewPort.appendChild(this.balanceWidget.getWidget())
        this.viewPort.appendChild(this.commandWidget.getWidget())

        for (let i = 0; i < this.viewPort.children.length; i++) {
            this.viewPort.children[i].hidden = false
        }
    }

    openWidget(widgetName, arg) {
        let widget = this.widgetMap.get(widgetName)
        this.viewPort.innerHTML = ''
        this.viewPort.appendChild(widget.getWidget())
        for (let i = 0; i < this.viewPort.children.length; i++) {
            this.viewPort.children[i].hidden = false
        }
        widget.show(arg)
    }

    send(target, msg, arg) {
        let targetWidget = this.widgetMap.get(target)
        console.log(target)
        targetWidget[msg](arg)
    }
}


function initWindowManager(commandWidget, balanceWidget, receiveWidget, sendWidget, sendTokenWidget) {
    let wM = new WindowManager()

    wM.viewPort = document.getElementById('viewport')
    // main view
    wM.commandWidget = commandWidget
    commandWidget.setWindowManager(wM)
    wM.balanceWidget = balanceWidget
    wM.widgetMap.set("balance", balanceWidget)
    balanceWidget.setWindowManager(wM)

    //other windows
    receiveWidget.setWindowManager(wM)
    wM.widgetMap.set('receive', receiveWidget)
    sendWidget.setWindowManager(wM)
    wM.widgetMap.set('send', sendWidget)
    sendTokenWidget.setWindowManager(wM)
    wM.widgetMap.set('sendtoken', sendTokenWidget)
    return wM
}

class Credentials {

    username
    password

    retrieveCredentials(source) {
        this.retrieveCredentialsFromStorage((mapicredentials) => {
            this.username = mapicredentials.mapicredentials.split('*')[0]
            this.password = mapicredentials.mapicredentials.split('*')[1]
            source.credentialsFoundListener()
        }, () => {
            source.credentialsNotFoundListener(this)
        })
    }

    retrieveCredentialsFromStorage(success, failure) {
        chrome.storage.local.get('mapicredentials', (mapicredentials) => {
            if (chrome.runtime.lastError) {
                console.log(chrome.runtime.lastError);
                failure()
                return
            }
            if ((Object.getPrototypeOf(mapicredentials) === Object.prototype) && !mapicredentials) {
                failure()
                return
            }
            success(mapicredentials);
        });
    }

    storeCredentials(username, password) {
        this.username = username
        this.password = password
        chrome.storage.local.set({'mapicredentials': username + "*" + password}, function () {
            if (chrome.runtime.lastError) {
                console.log(chrome.runtime.lastError);
                alert("Could not store credentials")
                return
            }
            alert("Stored credentials")
        })
    }

    credentialsFoundListener() {
        this.pk.sendBSV(this.sendAmountInput.value, this.destinationInput.value, this.username, this.password)
        this.sendAmountInput.value = ""
        this.destinationInput.value = ""
    }

    credentialsNotFoundListener(source) {
        let askCredentials = initMAPICredentialsAction()
        source.close()
        askCredentials.show(source)
    }

    credentialsEnteredListener(username, password) {
        this.storeCredentials(username, password)
        this.span.hidden = false
        alert(username + password)
        //this.pk.sendBSV(this.sendAmountInput.value, this.destinationInput.value)
        this.sendAmountInput.value = ""
        this.destinationInput.value = ""
    }

    credentialsCancelListener() {
        this.span.hidden = false
        alert("Must enter credentials")
    }

}

class EnterCredentialsWidget {
    span
    saveButton
    cancelButton
    usernameField
    passwordField

    show(source) {
        this.span.hidden = false
        this.saveButton.onclick = () => {
            this.close()
            source.credentialsEnteredListener(this.usernameField.value, this.passwordField.value)
        }
        this.cancelButton.onclick = () => {
            this.close()
            source.credentialsCancelListener()
        }
    }

    close() {
        this.span.hidden = true
    }
}

function initMAPICredentialsAction() {
    let mca = new EnterCredentialsWidget()

    mca.span = document.getElementById("request-mapi-credentials-span")
    mca.saveButton = document.getElementById("request-mapi-credentials-span-ok")
    mca.cancelButton = document.getElementById("request-mapi-credentials-span-cancel")
    mca.usernameField = document.getElementById("request-mapi-credentials-span-username")
    mca.passwordField = document.getElementById("request-mapi-credentials-span-password")

    return mca
}

class CreatePKWidget {
    widget
    createButton
    twelveWordsWidget
    twelveWordsText
    closeButton

    show(source, pk) {
        this.widget.hidden = false
        this.createButton.onclick = () => {
            let words = pk.createPK()
            this.closeButton.onclick = () => {
                this.close()
                source.pkCreatedListener()
            }
            this.twelveWordsText.innerHTML = words
            this.twelveWordsWidget.hidden = false
        }
    }

    close() {
        this.widget.hidden = true
    }
}

function initPKCreateWidget() {
    let pkCreateWidget = new CreatePKWidget()
    pkCreateWidget.widget = document.getElementById("pk-create-span")
    pkCreateWidget.createButton = document.getElementById("create-confirm")
    pkCreateWidget.twelveWordsWidget = document.getElementById('pk-create-span-12words-widget')
    pkCreateWidget.twelveWordsText = document.getElementById('pk-create-span-12words-text')
    pkCreateWidget.closeButton = document.getElementById('pk-create-span-close')

    return pkCreateWidget
}

class SendWidget {
    windowManager

    setWindowManager(windowManager) {
        this.windowManager = windowManager
    }

    span

    getWidget() {
        return this.span
    }

    sendButton
    sendAmountInput
    destinationInput
    closeButton

    pk

    show(pk) {
        this.pk = pk
        this.sendButton.onclick = async() => {
            try {
                await this.pk.sendBSV(this.sendAmountInput.value, this.destinationInput.value)
            } catch (err) {
                console.log(err)
                alert("Error sending satoshis:" + err)
                return
            }
            alert("Satoshis sent")
            this.windowManager.send("balance", "refresh")
            this.close()
        }
        this.closeButton.onclick = () => {
            this.close()
        }
    }

    close() {
        this.windowManager.showMain()
    }
}

function initSendWidget(windowManager) {
    let sendOp = new SendWidget()
    sendOp.windowManager = windowManager
    sendOp.span = document.getElementById("send-span")
    sendOp.sendButton = document.getElementById("send-span-confirm")
    sendOp.sendAmountInput = document.getElementById("send-span-input")
    sendOp.destinationInput = document.getElementById('send-span-destination')
    sendOp.closeButton = document.getElementById('send-span-close')
    return sendOp
}

class ReceiveWidget {

    windowManager
    widget
    closeButton
    addressInput
    copyAddressInput

    setWindowManager(windowManager) {
        this.windowManager = windowManager
    }

    getWidget() {
        return this.widget
    }

    show(address) {
        this.addressInput.innerHTML = address

        this.copyAddressInput.onclick = () => {
            fnCopyText(this.addressInput.innerHTML, 'copy-receive-span-address');
        }

        new QRCode(document.getElementById("qrcode"), {
            text: this.addressInput.innerHTML,
            width: 128,
            height: 128,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });

        this.closeButton.onclick = () => {
            document.getElementById("qrcode").innerHTML = ""
            this.close()
        }
    }

    close() {
        this.windowManager.showMain()
    }
}

function initReceiveWidget(windowManager) {
    let receiveOp = new ReceiveWidget()

    receiveOp.windowManager = windowManager
    receiveOp.widget = document.getElementById("receive-span")
    receiveOp.closeButton = document.getElementById("receive-span-close")
    receiveOp.addressInput = document.getElementById("receive-span-address")
    receiveOp.copyAddressInput = document.getElementById("copy-receive-span-address")

    return receiveOp
}

class BalanceWidget {
    show() {
    }

    close() {
    }

    windowManager

    setWindowManager(windowManager) {
        this.windowManager = windowManager
    }

    span

    getWidget() {
        return this.span
    }

    balanceField
    refreshButton
    pk

    tokenDiv
    tokenStub

    refresh() {
        bS.pk.balanceAsync(this)
    }

    refreshBalanceListener(totals) {
        this.balanceField.textContent = totals.satoshis
        if (totals.tokenBalances.length > 0) {
            this.tokenDiv.textContent = ''
            totals.tokenBalances.sort((a, b) => {
                return a.symbol < b.symbol ? -1 : -0
            })
            for (let i = 0; i < totals.tokenBalances.length; i++) {
                this.createTokenRow(totals.tokenBalances[i].symbol, totals.tokenBalances[i].balance)
            }
        }
    }

    createTokenRow(symbol, balance) {
        let row = this.tokenStub.cloneNode(true)
        for (var i = 0; i < row.children.length; i++) {
            if (row.children[i].id === 'balance-span-token-symbol') {
                row.children[i].textContent = symbol
                continue
            }
            if (row.children[i].id === 'balance-span-token-balance') {
                row.children[i].textContent = balance
                continue
            }
            if (row.children[i].id === 'balance-div-tokens-send') {
                let tokenSend = new TokenSend()
                tokenSend.symbol = symbol
                tokenSend.pk = this.pk
                row.children[i].onclick = () => {
                    this.windowManager.openWidget("sendtoken", tokenSend)
                }
            }
        }
        this.tokenDiv.appendChild(row)
        row.hidden = false
    }
}

function initBalanceWidget(pk) {
    bS = new BalanceWidget()

    bS.pk = pk
    bS.span = document.getElementById('balance-div')
    bS.balanceField = document.getElementById("balance-span-balance")
    bS.refreshButton = document.getElementById("balance-span-refresh")

    bS.refreshButton.onclick = () => {
        bS.pk.balanceAsync(bS)
    }

    bS.tokenDiv = document.getElementById('balance-div-tokens')
    bS.tokenStub = document.getElementById('balance-div-stub')
    return bS
}

class CommandWidget {

    windowManager

    setWindowManager(windowManager) {
        this.windowManager = windowManager
    }

    widget

    getWidget() {
        return this.widget
    }

    airdropButton
    mintButton

    pk
    createPKCommand

    show() {
    }

    close() {
    }

    //retrieve user's private key before anything else
    initPK() {
        this.pk.retrievePK(this)
    }

    pkRetrievedListener() {
        this.windowManager.showMain()
        this.windowManager.send("balance", "refresh")
    }

    pkCreatedListener() {
        this.windowManager.showMain()
    }

    pkNotFoundListener(source) {
        console.log("pkNotFoundListener")
        source.createPKCommand.show(source, source.pk)
    }

}

function initCommandWidget() {
    let cWid = new CommandWidget()
    cWid.widget = document.getElementById("command-widget")

    cWid.pk = new PK()
    cWid.createPKCommand = initPKCreateWidget()

    cWid.sendCommandButton = document.getElementById("main-span-send")
    cWid.sendCommandButton.onclick = () => {
        cWid.windowManager.openWidget('send', cWid.pk)
    }

    cWid.receiveCommandButton = document.getElementById("main-span-receive")
    cWid.receiveCommandButton.onclick = () => {
        cWid.windowManager.openWidget('receive', cWid.pk.address)
    }

    cWid.airdropButton = document.getElementById("main-span-airdrop")
    cWid.airdropButton.onclick = async () => {
        let chain = new Chain()
        try {
            await chain.airdrop(cWid.pk.address)
            alert("address airdropped")
            cWid.windowManager.send("balance", "refresh")
        } catch (err) {
            alert("Airdrop failed:" + err)
        }
    }

    cWid.mintButton = document.getElementById("main-span-mint")
    cWid.mintButton.onclick = async () => {
        let token = new Token()
        try {
            let symbol = await token.mint(cWid.pk)
            alert('Token ' + symbol + ' minted.')
            cWid.windowManager.send("balance", "refresh")
        } catch (err) {
            alert(err)
        }
    }

    return cWid
}

document.addEventListener("DOMContentLoaded", function (event) {
    debugger
    let mainWidget = initCommandWidget()
    initWindowManager(mainWidget,
        initBalanceWidget(mainWidget.pk),
        initReceiveWidget(),
        initSendWidget(),
        initSendTokenWidget())
    mainWidget.initPK()
})
