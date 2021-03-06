
import { Account } from './account';
import { Message } from './message';

import { BehaviorSubject, Subject } from 'rxjs';

import { nonenumerable } from 'nonenumerable';
import { find, reject, pullAt, extend } from 'lodash';

export interface DiscordMockAccount {
  tag: string;
  username: string;
}

export class LobbyState {
  accounts: Account[] = [];
  discordAccounts: DiscordMockAccount[] = [];
  messages: Message[] = [];
  motd: string;
  discordConnected: boolean;

  silverPurchases: any[] = [];
  silverPrices: { micro: any[], sub: any[] } = { micro: [], sub: [] };

  bonusInfo: any = {};

  @nonenumerable
  account$ = new BehaviorSubject<Account[]>([]);

  @nonenumerable
  newMessage$ = new Subject<number>();

  inGame = {};
  status = {};
  subTier = {};
  lobbyAccountDiscordHash = {};


  constructor({ accounts = [], messages = [], motd = '' }) {
    this.accounts = accounts;
    this.messages = messages;
    this.motd = motd;
  }

  syncTo(state: LobbyState) {
    const oldAccLength = this.accounts.length;
    const oldMessagesLength = this.messages.length;
    extend(this, state);

    if(this.accounts.length !== oldAccLength) {
      this.account$.next(this.accounts);
    }

    if(oldMessagesLength !== 0 && this.messages.length !== oldMessagesLength) {
      this.newMessage$.next(this.messages.length - oldMessagesLength);
    }

    this.lobbyAccountDiscordHash = {};
    this.accounts.forEach(acct => this.lobbyAccountDiscordHash[acct.discordTag] = true);
  }

  updateHashes() {
    this.accounts.forEach(account => {
      this.inGame[account.username] = account.inGame;
      this.status[account.username] = account.status;

      let tier = account.subscriptionTier;
      if(account.isTester) tier = 1;
      if(account.isGM) tier = 10;
      this.subTier[account.username] = tier;
    });
  }

  addMessage(message: Message) {
    if(!message.timestamp) message.timestamp = Date.now();

    this.messages.push(message);

    if(this.messages.length > 500) {
      this.messages.shift();
    }
  }

  findAccount(userId: string) {
    return find(this.accounts, { userId });
  }

  findAccountByUsername(username: string) {
    return find(this.accounts, { username });
  }

  addAccount(account: Account) {
    this.accounts.push(account);
    this.account$.next(this.accounts);
  }

  removeAccount(username: string) {
    this.accounts = reject(this.accounts, (account: Account) => account.username === username);
    this.account$.next(this.accounts);
  }

  setDiscordAlwaysOnlineUsers(accts: DiscordMockAccount[]) {
    this.discordAccounts = accts;
  }
}
