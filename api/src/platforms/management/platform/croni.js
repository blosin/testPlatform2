'use strict';
import Platform from '../platform';
import logger from '../../../config/logger';

class Croni extends Platform {
  constructor(platform) {
    super(platform);
    this.init();
    this.cronGetPlatformParameters();
  }

  async init() {
    if (this._platform) {
      console.log(`${this._platform.name}.\t\t Inicializated.`);
    } else {
      const msg = `[EMAIL-LOG] Can not initializate Croni.`;
      logger.error({ message: msg, meta: { platform: this._platform } });
    }
  }
}

export default Croni;
