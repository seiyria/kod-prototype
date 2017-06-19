
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class SackToMerchant extends Command {

  public name = '~StM';
  public format = 'Slot MerchantUUID';

  execute(player: Player, { room, client, gameState, args }) {

    const [slot, merchantUUID] = args.split(' ');

    const container = room.state.findNPC(merchantUUID);
    if(!container) return room.sendClientLogMessage(client, 'That person is not here.');
    if(container.distFrom(player) > 2) return room.sendClientLogMessage(client, 'That person is too far away.');

    if(!player.hasEmptyHand()) return room.sendClientLogMessage(client, 'Your hands are full.');

    const item = player.sack[+slot];
    if(!item) return false;

    player.sellItem(item);
    player.takeItemFromSack(slot);
  }

}
