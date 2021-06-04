'use strict';
import PedidosYa from '../pedidosYa';

class PedidosYaSingleton {
  constructor() {}

  static getInstance(platform) {
    if (!PedidosYaSingleton.instance) {
      PedidosYaSingleton.instance = new PedidosYa(platform);
    }
    return PedidosYaSingleton.instance;
  }
  static setInstance() {
    PedidosYaSingleton.instance = null;
  }
}

export default PedidosYaSingleton;
