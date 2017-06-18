
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class SackToKubby extends Command {

  public name = '~StK';
  public format = 'ItemSlot';

  execute(player: Player, { room, client, gameState, args }) {
    const slot = +args;
    if(isUndefined(slot)) return false;

    const item = player.sack[slot];
    if(!item) return false;

    if(!item.isKubbiable) return room.sendClientLogMessage(client, 'That item is not kubbiable.');

    if(!player.hasEmptyHand()) return room.sendClientLogMessage(client, 'Your hands are full.');

    if(player.fullKubby()) return room.sendClientLogMessage(client, 'Your kubby is full.');

    player.addItemToKubby(item);
    player.takeItemFromSack(slot);
  }

}

