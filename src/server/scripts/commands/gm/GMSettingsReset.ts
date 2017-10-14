
import { Command } from '../../../base/Command';
import { Player } from '../../../../models/player';
import { SettingsHelper } from '../../../helpers/settings-helper';

export class GMSettingsReset extends Command {

  public name = '@resetmapsettings';
  public format = '';

  async execute(player: Player, { room, gameState, args }) {
    if(!player.isGM) return;

    await SettingsHelper.resetMapSettings(room.mapRegion, room.mapName);
    room.loadGameSettings();
  }
}
