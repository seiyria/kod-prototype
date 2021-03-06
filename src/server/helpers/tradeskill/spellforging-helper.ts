
import { includes, random, clone, clamp, capitalize } from 'lodash';
import { IPlayer, SkillClassNames } from '../../../shared/interfaces/character';
import { RollerHelper } from '../../../shared/helpers/roller-helper';
import { AmmoClasses, EquippableItemClassesWithWeapons, IItem } from '../../../shared/interfaces/item';

export class SpellforgingHelper {

  static canSpellforge(player: IPlayer): boolean {
    return player.calcBaseSkillLevel(SkillClassNames.Conjuration) >= 1;
  }

  static canDisenchant(item: IItem): boolean {
    return includes(EquippableItemClassesWithWeapons, item.itemClass);
  }

  static async disenchant(player: IPlayer): Promise<string> {
    const container = player.tradeSkillContainers.spellforging;
    const item = container.modifyItem;

    let enosDust = 0;
    let owtsDust = 0;

    const itemQuality = item.quality || 0;

    enosDust += 1 + (itemQuality * 2);

    if(random(1, 5) <= itemQuality) owtsDust++;
    if(itemQuality === 5) owtsDust += 3;

    container.clearReagents();
    container.gainDust('enos', enosDust);
    container.gainDust('owts', owtsDust);

    player.gainExp(200 * (itemQuality + 1));

    // you only get to skill 10 from disenchanting
    if(player.calcBaseSkillLevel(SkillClassNames.Spellforging) < 10) {
      const gainedSkill = Math.max(1, 5 - player.calcSkillLevel(SkillClassNames.Spellforging)) + itemQuality;
      player.gainSkill(SkillClassNames.Spellforging, gainedSkill, true);
    }

    let retval = `You have gained ${enosDust} Enos Dust`;
    if(owtsDust > 0) retval = `${retval} and ${owtsDust} Owts Dust`;
    retval = `${retval} for disenchanting your ${item.itemClass.toLowerCase()}.`;
    return retval;
  }

  static successPercent(player: IPlayer): number {
    const container = player.tradeSkillContainers.spellforging;
    const item = container.modifyItem;
    const reagent = container.reagent;

    if(!item || !reagent) return 0;

    const conjSkill = player.calcSkillLevel(SkillClassNames.Conjuration);
    const forgeSkill = player.calcSkillLevel(SkillClassNames.Spellforging);

    if(reagent.itemClass === 'Rock') {
      const enchantLevel = item.enchantLevel;

      if(enchantLevel >= item.maxEnchantLevel) return 0;
      if(!enchantLevel) return 100;

      const bigMod = 1 / (item.maxEnchantLevel / 5);

      const forgeMod = 4 * bigMod;
      const conjMod = 5 * bigMod;

      const requiredForgeSkillLevel = enchantLevel * forgeMod;
      const requiredConjSkillLevel = enchantLevel * conjMod;

      const forgeVal = clamp((forgeSkill - requiredForgeSkillLevel + forgeMod) * 25, 0, 100);
      const conjVal = clamp((conjSkill - requiredConjSkillLevel + conjMod) * 20, 0, 100);

      return Math.floor((forgeVal + conjVal) / 2);
    }

    // only works for ammo
    if(includes(reagent.name, 'Runewritten Scroll')) {
      if(!includes(AmmoClasses, item.itemClass)) return 0;

      const level = (reagent.effect.potency / 4);

      return clamp((forgeSkill - level) * 15, 0, 100);
    }

    if(reagent.itemClass === 'Scroll') {
      const level = reagent.trait.level;
      const requiredSkillLevel = (level - 1) * 5;

      if(forgeSkill >= requiredSkillLevel) return 100;
      return clamp((forgeSkill - requiredSkillLevel + 5) * 20, 0, 100);
    }
  }

  static enchant(player: IPlayer): boolean {
    const container = player.tradeSkillContainers.spellforging;
    const item = container.modifyItem;
    const reagent = container.reagent;
    if(reagent.upgrades) {
      reagent.upgrades.forEach(upgrade => {
        reagent.removeUpgrade(0);
      })
    }

    if(!RollerHelper.XInOneHundred(this.successPercent(player))) {
      container.clearIngredient();
      return false;
    }

    player.setTradeskillBusy();

    player.$$statistics.craftSpellforging();

    if(reagent.itemClass === 'Rock') {

      const upgrade = {
        name: reagent.name,
        sprite: reagent.sprite,
        stats: reagent.stats
      };

      item.addUpgrade(upgrade);

      container.result = item;
      container.clearReagents();

      // enchanting only gives you skill up to a point. +1 works to skill 4, +2 to skill 8, etc
      if(player.calcBaseSkillLevel(SkillClassNames.Spellforging) < item.enchantLevel * 4) {
        player.gainSkill(SkillClassNames.Spellforging, item.enchantLevel * 25, true);
      }

      player.setTradeskillFree();

      return true;
    }

    if(includes(reagent.name, 'Runewritten Scroll')) {
      item.effect = clone(reagent.effect);
      delete item.effect.uses;
      item.effect.chance = Math.min(100, player.calcSkillLevel(SkillClassNames.Spellforging) * 2);
      container.result = item;
      container.clearReagents();

      // you only get skill from runewritten scrolls up to their written skill level
      if(player.calcBaseSkillLevel(SkillClassNames.Spellforging) < item.effect.potency) {
        player.gainSkill(SkillClassNames.Spellforging, item.effect.potency * 10, true);
      }

      player.setTradeskillFree();

      return true;
    }

    if(reagent.itemClass === 'Scroll') {
      item.trait = clone(reagent.trait);
      container.result = item;
      container.clearReagents();

      // trait enchanting only gives skill up to a point, +1 to skill 4, +2 to skill 8, etc
      if(player.calcSkillLevel(SkillClassNames.Spellforging) < item.trait.level * 4) {
        player.gainSkill(SkillClassNames.Spellforging, item.trait.level * 20, true);
      }

      player.setTradeskillFree();

      return true;
    }

    player.setTradeskillFree();

    return true;
  }

  static async createBrickFor(player: IPlayer, type: string): Promise<void> {
    type = capitalize(type);
    const brick = await player.$$room.itemCreator.getItemByName(`Enchanting Brick - ${type}`);
    player.tradeSkillContainers.spellforging.result = brick;

    if(player.calcBaseSkillLevel(SkillClassNames.Spellforging) < 5) {
      player.gainSkill(SkillClassNames.Spellforging, 1, true);
    }
  }
}
