
import { Trait } from '../../models/trait';
import { Player } from '../../models/player';

export class ForcefulStrike extends Trait {

  static baseClass = 'Warrior';
  static traitName = 'ForcefulStrike';
  static description = 'Strike more forcefully with your weapon, dealing additional damage if your health is above 85%.';
  static icon = 'striped-sword';

  static tpCost = 10;
  static maxLevel = 20;

  static currentlyInEffect(player: Player): boolean {
    return player.hp.gtePercent(85);
  }

}
