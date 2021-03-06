
import { sample } from 'lodash';

import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { StatName } from '../../../shared/interfaces/character';

export class RecentlyHasted extends SpellEffect {

  iconData = {
    name: 'time-trap',
    color: '#000',
    tooltipDesc: 'Recently hasted. Actions are 33% slower. Hasting during this period will lower one physical stat.'
  };

  private ticks: number;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.duration = 60;
    this.ticks = 0;
    target.applyEffect(this);
  }

  effectTick(char: Character) {
    this.ticks++;
    this.effectInfo.isFrozen = this.ticks % 3 === 0;
  }
}

export class Haste extends SpellEffect {

  iconData = {
    name: 'time-trap',
    color: '#0a0',
    tooltipDesc: 'Use one extra action per round.'
  };

  maxSkillForSkillGain = 25;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);
    this.flagUnapply();
    this.flagCasterName(caster.name);

    if(!this.duration) this.duration = 45 * this.potency;
    this.updateBuffDurationBasedOnTraits(caster);

    if(caster !== target) {
      this.casterEffectMessage(caster, { message: `You cast Haste on ${target.name}.`, sfx: 'spell-buff-physical' });
    }

    this.aoeAgro(caster, 100);

    const recentlyHasted = target.hasEffect('RecentlyHasted');
    if(recentlyHasted && target.isPlayer()) {
      target.unapplyEffect(recentlyHasted, true);
      target.sendClientMessage('You feel a wrenching sensation.');
      const lostStat = sample(['str', 'dex', 'agi', 'con']);
      target.loseBaseStat(<StatName>lostStat, 1);
    }

    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.targetEffectMessage(char, { message: 'The world around you appears to slow down.', sfx: 'spell-buff-physical' });
    this.gainStat(char, 'actionSpeed', 1);
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'The world around you returns to normal speed.');

    if(this.duration <= 0 && !this.autocast) {
      const recentlyHasted = new RecentlyHasted({});
      recentlyHasted.cast(char, char);
    }
  }
}
