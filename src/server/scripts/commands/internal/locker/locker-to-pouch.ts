
import { isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class LockerToPouch extends Command {

  public name = '~WtD';
  public format = 'ItemSlot LockerID [Amt]';

  async execute(player: Player, { room, args }) {
    if(this.isAccessingLocker(player)) return;
    const [slotId, lockerId, amt] = args.split(' ');
    if(isUndefined(slotId)) return;

    const slot = +slotId;
    const amount = +amt;

    this.accessLocker(player);
    if(!this.findLocker(player)) return this.unaccessLocker(player);

    const locker = await player.$$room.lockerHelper.loadLocker(player, lockerId);
    if(!locker) return this.unaccessLocker(player);

    const item = locker.takeItemFromSlot(slot, amount);
    if(!item) return this.unaccessLocker(player);

    if(!player.addItemToPouch(item)) return this.unaccessLocker(player);
    room.updateLocker(player, locker);
    this.unaccessLocker(player);
  }

}
