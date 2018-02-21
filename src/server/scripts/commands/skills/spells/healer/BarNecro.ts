
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../shared/models/character';
import { BarNecro as CastEffect } from '../../../../../effects/buffs/BarNecro';

export class BarNecro extends Skill {

  static macroMetadata = {
    name: 'BarNecro',
    macro: 'cast barnecro',
    icon: 'rosa-shield',
    color: '#1b390e',
    mode: 'clickToTarget',
    tooltipDesc: 'Shield necrotic damage for a single target. Cost: 40 MP'
  };

  public name = ['barnecro', 'cast barnecro'];
  public format = 'Target';

  mpCost = () => 40;
  range = () => 5;

  execute(user: Character, { gameState, args, effect }) {

    const target = this.getTarget(user, args, true);
    if(!target) return;

    if(!this.tryToConsumeMP(user, effect)) return;

    this.use(user, target, effect);
  }

  use(user: Character, target: Character, baseEffect = {}) {
    const effect = new CastEffect(baseEffect);
    effect.cast(user, target, this);
  }

}
