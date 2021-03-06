
import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

import { SpellforgingHelper } from '../../../../helpers/tradeskill/spellforging-helper';

export class Disenchant extends Command {

  public name = 'disenchant';
  public format = 'EnchUUID';

  async execute(player: Player, { room, args }) {
    if(!args) return false;
    if(!SpellforgingHelper.canSpellforge(player)) return player.sendClientMessage('You are not skilled enough to Spellforge.');

    const ench = room.state.findNPC(args);
    if(!ench) return player.sendClientMessage('That person is not here.');

    const container = player.tradeSkillContainers.spellforging;

    if(container.result) return player.sendClientMessage('You need to remove your previous result first.');
    if(!container.modifyItem) return player.sendClientMessage('You can\'t disenchant nothing.');

    if(!container.modifyItem.isOwnedBy(player)) return player.sendClientMessage('You can\'t disenchant someone elses items!');

    if(!SpellforgingHelper.canDisenchant(container.modifyItem)) return player.sendClientMessage('You can\'t disenchant that.');

    const message = await SpellforgingHelper.disenchant(player);

    player.sendClientMessage(message);
  }

}
