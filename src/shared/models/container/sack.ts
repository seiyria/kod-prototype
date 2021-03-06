
import { extend } from 'lodash';

import { Container } from './container';

export class Sack extends Container {
  constructor(opts) {
    super({ size: opts.size || 25 });
    extend(this, opts);
    this.initItems();
  }

  canAccept(item) {
    return item.isSackable && super.canAccept(item);
  }
}
