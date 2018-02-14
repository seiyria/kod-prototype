
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { ItemCreator } from '../../../helpers/item-creator';
import { SubscriptionHelper } from '../../../helpers/subscription-helper';

export class GMGainSkill extends Command {

  public name = '@skill';
  public format = 'SkillName Amount';

  async execute(player: Player, { room, gameState, args }) {
    if(!SubscriptionHelper.isGM(player)) return;

    const [skillname, amount] = args.split(' ');
    if(!player.isValidSkill(skillname)) return false;

    const skillGain = +amount;
    player._gainSkill(skillname, skillGain);
  }
}
