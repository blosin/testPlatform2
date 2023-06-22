'use strict';
import RappiSingleton from './platform/instance/rappiSingleton';
import PedidosYaSingleton from './platform/instance/pedidosYaSingleton';
import PeyaSingleton from './platform/instance/peyaSingleton';
import PadSingleton from './platform/instance/padSingleton';
import GlovoSingleton from './platform/instance/glovoSingleton';
import RapiboySingleton from './platform/instance/rapiboySingleton';
import CroniSingleton from './platform/instance/croniSingleton';
import PerformanceSingleton from './platform/instance/performanceSingleton';
import UberEatsSingleton from './platform/instance/uberEatsSingleton';
import ThirdPartySingleton from './platform/instance/thirdPartySingleton';

class PlatformFactory {
  createPlatform(platform, uuid, setInstance = false) {
    let platformSingleton;
    switch (platform.internalCode) {
      case 1: //'PEDIDOSYA'
        if (setInstance) PedidosYaSingleton.getInstance(platform);
        else {
          platformSingleton = PedidosYaSingleton.getInstance(platform);
          platformSingleton.uuid = uuid;
          return platformSingleton;
        }

      case 113: //'PEDIDOSYA'
        if (setInstance) PeyaSingleton.getInstance(platform);
        else {
          platformSingleton = PeyaSingleton.getInstance(platform);
          platformSingleton.uuid = uuid;
          return platformSingleton;
        }

      case 2: //'RAPPI'
        if (setInstance) RappiSingleton.setInstance();
        else {
          platformSingleton = RappiSingleton.getInstance(platform);
          platformSingleton.uuid = uuid;
          return platformSingleton;
        }

      case 4: //'UBEREATS'
        if (setInstance) UberEatsSingleton.setInstance();
        else {
          platformSingleton = UberEatsSingleton.getInstance(platform);
          platformSingleton.uuid = uuid;
          return platformSingleton;
        }

      case 5: //'PAD'
        if (setInstance) PadSingleton.setInstance();
        else {
          platformSingleton = PadSingleton.getInstance(platform);
          platformSingleton.uuid = uuid;
          return platformSingleton;
        }

      case 7: //'RAPIBOY'
        if (setInstance) RapiboySingleton.setInstance();
        else {
          platformSingleton = RapiboySingleton.getInstance(platform);
          platformSingleton.uuid = uuid;
          return platformSingleton;
        }

      case 9: //'GLOVO'
        if (setInstance) GlovoSingleton.setInstance();
        else {
          platformSingleton = GlovoSingleton.getInstance(platform);
          platformSingleton.uuid = uuid;
          return platformSingleton;
        }

      case 10: //'PERFORMANCE'
        if (setInstance) PerformanceSingleton.setInstance();
        else {
          platformSingleton = PerformanceSingleton.getInstance(platform);
          platformSingleton.uuid = uuid;
          return platformSingleton;
        }

      default:
        if (setInstance) {
          ThirdPartySingleton.setInstance();
        } else {
          platformSingleton = ThirdPartySingleton.getInstance(platform);
          platformSingleton.uuid = uuid;
          return platformSingleton;
        }
    }
  }
}

export default PlatformFactory;
