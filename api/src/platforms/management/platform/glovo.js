'use strict';
import Platform from '../platform';
import logger from '../../../config/logger';

class Glovo extends Platform {
  constructor(platform) {
    super(platform);
    this.init();
    this.cronGetPlatformParameters();
  }

  async init() {
    if (
      this._platform &&
      this._platform.credentials &&
      this._platform.credentials.data &&
      this._platform.credentials.data.token
    ) {
      this._token = this._platform.credentials.data.token;
      console.log(`${this._platform.name}.\t\t Inicializated.`);
    } else {
      const msg = `[EMAIL-LOG] Can not initializate Glovo.`;
      logger.error({ message: msg, meta: { platform: this._platform } });
    }
  }

  /**
   *
   * @override
   */
  importParser() {
    return require('../../interfaces/glovo');
  }

  async saveGlovoOrder(order, tokenAuth) {
    /* Validate Token */
    if (tokenAuth != this._token) {
      const msg = `Failed to push order. Cannot authorize token`;
      const error = logger.error({ message: msg });
      return Promise.reject(error);
    }
    return this.validateNewOrders(order);
  }
}

export default Glovo;
