
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  { chance: 1, result: 'Dedlaen Skeleton Knight' },
  { chance: 5, result: 'Dedlaen Skeleton' }
];

export class SkeletonRoomSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 20,
      initialSpawn: 2,
      maxCreatures: 8,
      spawnRadius: 2,
      randomWalkRadius: 7,
      leashRadius: 12,
      npcIds
    });
  }

}
