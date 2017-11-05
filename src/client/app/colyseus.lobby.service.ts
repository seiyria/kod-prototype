import { Injectable } from '@angular/core';

import * as swal from 'sweetalert2';

import { AuthService } from './auth.service';

import { LobbyState } from '../../shared/models/lobbystate';
import { Account } from '../../shared/models/account';

import { Observable } from 'rxjs/Observable';
import { extend } from 'lodash';

@Injectable()
export class ColyseusLobbyService {

  client: any;
  colyseus: any;
  room: any;
  lobbyState: LobbyState = new LobbyState({});
  myAccount: Account = new Account({});
  myCharacter: any = { name: '' };

  constructor(private auth: AuthService) {}

  init(colyseus, client) {
    this.colyseus = colyseus;
    this.client = client;

    this.client.onOpen.add(() => {
      this.initLobby();
      this.startHeartbeat();
    });
  }

  private initLobby() {
    if(!this.client) throw new Error('Client not intialized; cannot initialize lobby connection.');

    this.room = this.client.join('Lobby');

    this.room.onUpdate.add((state) => {
      this.lobbyState.syncTo(state);
    });

    this.room.onData.add((data) => {
      this.interceptLobbyCommand(data);
    });

    this.room.onError.add((e) => {
      alert(e);
    });
  }

  private loginThenEmit() {
    this.auth.login();
  }

  private emitUserId() {
    const userId = localStorage.getItem('user_id');
    const idToken = localStorage.getItem('access_token');
    const username = localStorage.getItem('user_name');

    this.room.send({ userId, idToken, username });
  }

  private async sendUserId() {
    await this.auth.isReady;

    const hasIdToken = localStorage.getItem('access_token');
    const hasUserId = localStorage.getItem('user_id');

    if(hasUserId && hasIdToken) {
      this.emitUserId();
    } else if(hasIdToken) {
      this.emitUserId();
    } else {
      this.loginThenEmit();
    }
  }

  private getUserName(fromError = false) {
    let titleText = 'Enter your desired username.';
    if(fromError) {
      titleText = `${titleText} Your previous account id is already in use. Please choose another.`;
    }

    (<any>swal)({
      titleText,
      text: 'It must be between 2 and 20 characters.',
      input: 'text',
      type: fromError ? 'error' : null,
      allowOutsideClick: false,
      allowEscapeKey: false,
      preConfirm: (username) => {
        return new Promise((resolve, reject) => {
          if(username.length < 2 || username.length > 20) reject('Username is not the right size');
          resolve();
        });
      }
    }).then(username => {
      localStorage.setItem('user_name', username);
      this.sendUserId();
    }).catch(() => {});
  }

  private setAccount(account) {
    this.myAccount = account;
  }

  private setCharacter(character) {
    this.myCharacter = character;
  }

  private interceptLobbyCommand({ action, error, ...other }) {
    if(error) {

      if(error === 'error_invalid_token') {
        this.loginThenEmit();
        return;
      }

      if(error === 'account_exists') {
        this.getUserName(true);
        return;
      }

      (<any>swal)({
        titleText: other.prettyErrorName,
        text: other.prettyErrorDesc,
        type: 'error'
      });

      return;
    }

    if(action === 'alert')          return this.popupAlert({ sender: other.sender, message: other.message });
    if(action === 'need_user_id')   return this.sendUserId();
    if(action === 'need_user_name') return this.getUserName();
    if(action === 'set_account')    return this.setAccount(other.account);
    if(action === 'set_character')  return this.setCharacter(other.character);
    if(action === 'start_game')     return this.startGame(other.character);
  }

  private logout() {
    this.auth.logout();
    this.room.send({ action: 'logout' });

    window.location.reload();
  }

  private startGame(character) {
    this.colyseus.initGame(character);
  }

  public sendMessage(message) {
    if(message.startsWith('/') && this.doCommand(message)) return;

    this.room.send({ message });
  }

  public getCharacterCreatorCharacter() {
    const opts = this.myCharacter;
    opts.characterCreator = true;
    this.room.send(opts);
  }

  public createCharacter(charSlot) {
    this.room.send({ action: 'create', charSlot, character: this.myCharacter });
  }

  public playCharacter(charSlot) {
    this.room.send({ action: 'play', charSlot });
  }

  public doCommand(string): boolean {
    const command = string.split(' ')[0];
    const args = string.substring(string.indexOf(' ')).trim();

    if(command === '/motd') {
      this.setMOTD(args);
      return true;
    }

    if(command === '/resetmotd') {
      this.resetMOTD();
      return true;
    }

    if(command === '/alert') {
      this.broadcastAlert(args);
      return true;
    }

    return false;
  }

  public quit() {
    this.room.send({ action: 'quit' });
  }

  public setMOTD(newMOTD) {
    this.room.send({ action: 'motd_set', motd: newMOTD });
  }

  public resetMOTD() {
    this.room.send({ action: 'motd_set', motd: '' });
  }

  public broadcastAlert(message) {
    this.room.send({ action: 'alert', message });
  }

  public popupAlert({ sender, message }) {
    (<any>swal)({
      titleText: `GM Alert from ${sender}`,
      text: message,
      type: 'info'
    });
  }

  public changeStatus(status) {
    this.room.send({ action: 'status', status });
  }

  public startHeartbeat() {
    const source = Observable.interval(20000);
    source.subscribe(() => {
      this.room.send({ action: 'heartbeat' });
    });
  }
}
