
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class Secondwind extends SpellEffect {

  iconData = {
    name: 'wing-cloak',
    color: '#a0a',
    tooltipDesc: 'Will not lose gear when eaten or stripped.'
  };

  maxSkillForSkillGain = 25;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);
    this.flagUnapply();
    this.flagCasterName(caster.name);

    if(caster !== target) {
      this.casterEffectMessage(caster, `You cast Secondwind on ${target.name}.`);
    }

    this.aoeAgro(caster, 10);

    if(!this.duration) this.duration = this.potency * 10;
    this.updateDurationBasedOnTraits(caster);

    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.targetEffectMessage(char, 'You are enclosed by a safe aura!');
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your safety aura fades.');
  }
}
