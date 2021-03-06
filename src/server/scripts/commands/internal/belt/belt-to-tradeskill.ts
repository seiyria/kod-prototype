
import { isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class BeltToTradeskill extends Command {

  public name = '~BtT';
  public format = 'ItemSlot TradeskillSlot TradeskillDestSlot AlchUUID';

  execute(player: Player, { room, args }) {
    const [sackSlot, tsSlot, tsDestSlot, alchUUID] = args.split(' ');
    if(this.isBusy(player)) return;
    if(isUndefined(sackSlot) || !tsSlot || isUndefined(tsDestSlot) || !alchUUID) return false;

    const container = room.state.findNPC(alchUUID);
    if(!container) return player.sendClientMessage('That person is not here.');

    const item = player.belt.getItemFromSlot(+sackSlot);
    if(!item) return false;

    const added = this.addItemToContainer(player, player.tradeSkillContainers[tsSlot], item, +tsDestSlot);
    if(!added) return;

    player.belt.takeItemFromSlot(+sackSlot);
  }

}
