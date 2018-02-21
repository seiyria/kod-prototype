
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../shared/models/character';
import { EnergyWave as CastEffect } from '../../../../../effects/damagers/EnergyWave';

export class EnergyWave extends Skill {

  static macroMetadata = {
    name: 'EnergyWave',
    macro: 'cast energywave',
    icon: 'beams-aura',
    color: '#000080',
    mode: 'autoActivate',
    tooltipDesc: 'Cast an area energy effect from your location (5x5). Cost: 40 MP'
  };

  public name = ['energywave', 'cast energywave'];
  public format = '';

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
