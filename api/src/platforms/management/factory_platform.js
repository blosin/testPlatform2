'use strict';
import RappiSingleton from './platform/instance/rappiSingleton';
import PedidosYaSingleton from './platform/instance/pedidosYaSingleton';
import PadSingleton from './platform/instance/padSingleton';
import GlovoSingleton from './platform/instance/glovoSingleton';
import RapiboySingleton from './platform/instance/rapiboySingleton';
import CroniSingleton from './platform/instance/croniSingleton';
import PerformanceSingleton from './platform/instance/performanceSingleton';
import UberEatsSingleton from './platform/instance/uberEatsSingleton';
import ThirdPartySingleton from './platform/instance/thirdPartySingleton';

class PlatformFactory {
  createPlatform(platform, uuid) {
    let platformSingleton;
    switch (platform.internalCode) {
      case 1: //'PEDIDOSYA'
        platformSingleton = PedidosYaSingleton.getInstance(platform);
        platformSingleton.uuid = uuid;
        return platformSingleton;

      case 2: //'RAPPI'
        platformSingleton = RappiSingleton.getInstance(platform);
        platformSingleton.uuid = uuid;
        return platformSingleton;

      case 4: //'UBEREATS'
        platformSingleton = UberEatsSingleton.getInstance(platform);
        platformSingleton.uuid = uuid;
        return platformSingleton;

      case 5: //'PAD'
        platformSingleton = PadSingleton.getInstance(platform);
        platformSingleton.uuid = uuid;
        return platformSingleton;

      case 6: //'CRONI'
        platformSingleton = CroniSingleton.getInstance(platform);
        platformSingleton.uuid = uuid;
        return platformSingleton;

      case 7: //'RAPIBOY'
        platformSingleton = RapiboySingleton.getInstance(platform);
        platformSingleton.uuid = uuid;
        return platformSingleton;

      case 9: //'GLOVO'
        platformSingleton = GlovoSingleton.getInstance(platform);
        platformSingleton.uuid = uuid;
        return platformSingleton;

      case 10: //'PERFORMANCE'
        platformSingleton = PerformanceSingleton.getInstance(platform);
        platformSingleton.uuid = uuid;
        return platformSingleton;

      default:
        platformSingleton = ThirdPartySingleton.getInstance(platform);
        platformSingleton.uuid = uuid;
        return platformSingleton;
    }
  }
}

export default PlatformFactory;
