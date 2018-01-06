
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { ShadowMeld as CastEffect } from '../../../../../effects/ShadowMeld';

export class ShadowMeld extends Skill {

  static macroMetadata = {
    name: 'ShadowMeld',
    macro: 'cast shadowmeld',
    icon: 'hidden',
    color: '#00c',
    mode: 'autoActivate',
    tooltipDesc: 'Force a shadow to follow you and meld with it. Cost: 50 HP'
  };

  public name = ['shadowmeld', 'cast shadowmeld'];

  mpCost = () => 50;
  range = () => 0;

  execute(user: Character, { gameState, args, effect }) {

    const target = this.getTarget(user, args, true);
    if(!target) return;

    if(!this.tryToConsumeMP(user, effect)) return;

    if(user.hasEffect('Hidden')) return user.sendClientMessage('You cannot meld with shadows you are hidden in!');

    this.use(user, user);
  }

  use(user: Character, target: Character) {
    const effect = new CastEffect({});
    effect.cast(user, target, this);
  }

}