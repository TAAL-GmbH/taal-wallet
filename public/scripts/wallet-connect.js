class ConnectionData {
    origin
}

class WalletConnection {

    retrieveConnection(origin, source) {
        if (!origin) {
            source.connectionNotFoundListener(source)
            return
        }
        this.retrieveConnectionFromStorage(origin, (result) => {
            source.connectionRetrievedListener()
        }, () => {
            source.connectionNotFoundListener(source)
        })
    }

    retrieveConnectionFromStorage(origin, success, failure) {
        let key = 'origin:' + origin
        chrome.storage.local.get([key], (connectionData) => {
            if (chrome.runtime.lastError) {
                console.log(chrome.runtime.lastError);
                failure()
                return
            }
            if (!connectionData[key]) {
                failure()
                return
            }
            success(connectionData);
        });
    }

    removeConnectionFromStorage(origin, sendResponse) {
        let key = 'origin:' + origin
        chrome.storage.local.remove(key, () => {
            if (chrome.runtime.lastError) {
                sendResponse(chrome.runtime.lastError)
                return
            }
            sendResponse("disconnected")
        })
    }
}


