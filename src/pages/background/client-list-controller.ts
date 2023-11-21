import { Client } from './client';

import { store } from '@/store';
import { addClient, removeClient } from '@/features/client-slice';

class ClientList {
  private _clientList: Client[] = [];

  private _updateBadge() {
    const text = this._clientList.length ? `${this._clientList.length}` : '';
    chrome.action.setBadgeText({ text });
  }

  public add(client: Client) {
    this._clientList.push(client);
    store.dispatch(addClient({ origin: client.getOrigin() }));
    this._updateBadge();
  }

  public remove(client: Client) {
    this._clientList = this._clientList.filter(c => c !== client);
    store.dispatch(removeClient({ origin: client.getOrigin() }));
    this._updateBadge();
  }
}

export const clientList = new ClientList();
