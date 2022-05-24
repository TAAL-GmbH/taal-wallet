// this.port.postMessage({ payload: 'anything' });

type Options = {
  name: string;
  extensionId: string;
  onConnect?: (port: chrome.runtime.Port) => void;
  onDisconnect?: (port: chrome.runtime.Port) => void;
};

type MessagePayload = {
  action: string;
  payload?: unknown;
  requestId?: number;
};

type RequestObject<T> = {
  requestId: number;
  resolve: (value?: T) => void;
  reject: (reason?: unknown) => void;
  rejectTimer: ReturnType<typeof setTimeout>;
};

class WalletCommunicator {
  private _extensionId: string;
  private _name: string;
  private _port: chrome.runtime.Port;
  private _connected = false;
  private _requestMap: Record<number, RequestObject<any>> = {};
  private _subscriptions: Record<string, ((payload: unknown) => void)[]> = {};

  constructor({ name, extensionId, onConnect, onDisconnect }: Options) {
    if (!name) {
      throw new Error('name is required');
    }
    if (!extensionId) {
      throw new Error('extensionId is required');
    }
    this._name = name;
    this._extensionId = extensionId;
    this._onMessage = this._onMessage.bind(this);
    this._onConnect = this._onConnect.bind(this);
    this._onDisconnect = this._onDisconnect.bind(this);

    this.on('connect', this._onConnect);
    this.on('diconnect', this._onDisconnect);
  }

  public connect() {
    this._port = chrome.runtime.connect(this._extensionId, {
      name: this._name,
    });

    this._port.onDisconnect.addListener(this._onDisconnect);
    this._port.onMessage.addListener(this._onMessage);

    this._port.postMessage({ action: 'connect' });
  }

  private _onConnect() {
    this._connected = true;
  }

  public disconnect() {
    this._port.disconnect();
    this._onDisconnect();
  }

  private _onDisconnect() {
    this._connected = false;

    this._port.onDisconnect.removeListener(this._onDisconnect);
    this._port.onMessage.removeListener(this._onMessage);

    this._subscriptions['disconnect']?.forEach(cb => cb(null));

    // reject all pending promises
    Object.values(this._requestMap).forEach(requestObject => {
      clearTimeout(requestObject.rejectTimer);
      requestObject.reject('disconnected');
      this._removeRequest(requestObject.requestId);
    });
  }

  private _onMessage(msg: MessagePayload) {
    if (msg.requestId) {
      if (msg.action === 'error') {
        this._rejectRequest(msg);
      } else {
        this._resolveRequest(msg);
      }
    }
    this._subscriptions[msg.action]?.forEach(cb => cb(msg.payload));
  }

  private _resolveRequest({ payload, requestId }: MessagePayload) {
    const requestObject = this._requestMap[requestId];
    if (requestObject) {
      this._removeRequest(requestId);
      clearTimeout(requestObject.rejectTimer);
      requestObject.resolve(payload);
    } else {
      console.warn('unknown requestId', requestId);
    }
  }

  private _rejectRequest({ payload, requestId }: MessagePayload) {
    const requestObject = this._requestMap[requestId];
    if (requestObject) {
      this._removeRequest(requestId);
      clearTimeout(requestObject.rejectTimer);
      requestObject.reject(payload || { reason: 'unknown error' });
    } else {
      console.warn('unknown requestId', requestId);
    }
  }

  private _removeRequest(requestId: number) {
    delete this._requestMap[requestId];
  }

  public postMessage(msg: MessagePayload) {
    if (!this._connected) {
      throw new Error("can't post message before connected");
    }

    this._port.postMessage(msg);
  }

  public request<T>({
    action,
    payload,
    timeout = 5000,
  }: MessagePayload & { timeout?: number }) {
    const requestId = Date.now() + Math.random();
    const requestObject = {
      requestId,
    } as RequestObject<T>;

    requestObject.rejectTimer = setTimeout(() => {
      requestObject.reject({ success: false, reason: 'timeout' });
      this._removeRequest(requestId);
    }, timeout);

    const promise = new Promise<T>((resolve, reject) => {
      requestObject.resolve = resolve;
      requestObject.reject = reject;
    });

    this._requestMap[requestId] = requestObject;
    this.postMessage({ action, payload, requestId });
    return promise;
  }

  public isConnected() {
    return this._connected;
  }

  public on(eventName: string, cb: (args: any) => void) {
    this._subscriptions[eventName] = this._subscriptions[eventName] || [];
    this._subscriptions[eventName].push(cb);
  }
}

export class WalletClient extends WalletCommunicator {
  constructor(options: Options) {
    super(options);
  }

  public getAddress() {
    return this.request<string | null>({
      action: 'get-address',
    });
  }

  public getBalance() {
    return this.request<number | null>({
      action: 'get-balance',
    });
  }
}
