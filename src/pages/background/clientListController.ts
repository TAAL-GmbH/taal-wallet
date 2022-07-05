import { Client } from './client';

class ClientList {
  private _clientList: Client[] = [];

  private _updateBadge() {
    const text = this._clientList.length ? `${this._clientList.length}` : '';
    chrome.action.setBadgeText({ text });
  }

  public add(client: Client) {
    this._clientList.push(client);
    this._updateBadge();
  }

  public remove(client: Client) {
    this._clientList = this._clientList.filter(c => c !== client);
    this._updateBadge();
  }
}

export const clientList = new ClientList();
