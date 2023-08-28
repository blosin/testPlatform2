import NewsTypeSingleton from '../../../utils/newsType';
import { APP_BRANCH } from '../../../utils/errors/codeError';
import CustomError from '../../../utils/errors/customError';

import ReceiveStrategy from './orderStrategy/receiveStrategy';
import ViewStrategy from './orderStrategy/viewStrategy';
import ConfirmStrategy from './orderStrategy/confirmStrategy';
import BranchRejectStrategy from './orderStrategy/branchRejectStrategy';
import DispatchStrategy from './orderStrategy/dispatchStrategy';
import DeliveryStrategy from './orderStrategy/deliveryStrategy';
import RetrieveDriverStrategy from './orderStrategy/retriveDriverStrategy';
import CloseRestaurantStrategy from './globalStrategy/closeRestaurantStrategy';
import OpenRestaurantStrategy from './globalStrategy/openRestaurantStrategy';
import WarningRestaurantStrategy from './globalStrategy/warningRestaurantStrategy';
import NewStrategy from './orderStrategy/newStrategy';
import PlatformRejectStrategy from './orderStrategy/platformRejectStrategy';
import logError from '../../../models/logError';

class SetNews {
  constructor(branchId, uuid) {
    this.branchId = branchId;
    this.uuid = uuid;
  }

  setNews(newToSet, data) {
    try {
      switch (newToSet.typeId) {
        /* Branch Received order */
        case NewsTypeSingleton.idByCod('receive_ord'):
          this.strategy = new ReceiveStrategy(newToSet);
          break;

        /* Branch Viewed order */
        case NewsTypeSingleton.idByCod('view_ord'):
          this.strategy = new ViewStrategy(newToSet);
          break;

        /* Branch Confirmed order */
        case NewsTypeSingleton.idByCod('confirm_ord'):
          this.strategy = new ConfirmStrategy(newToSet);
          break;

        /* Branch BranchRejected order */
        case NewsTypeSingleton.idByCod('rej_ord'):
          this.strategy = new BranchRejectStrategy(newToSet);
          break;

        /* Branch DispatchedOrder order */
        case NewsTypeSingleton.idByCod('disp_ord'):
          this.strategy = new DispatchStrategy(newToSet);
          break;

        /* Branch DeliveredOrder order */
        case NewsTypeSingleton.idByCod('deliv_ord'):
          this.strategy = new DeliveryStrategy(newToSet);
          break;

        /* Branch Retrive driver */
        case NewsTypeSingleton.idByCod('driver_ord'):
          this.strategy = new RetrieveDriverStrategy(newToSet);
          break;

        /* Branch closed */
        case NewsTypeSingleton.idByCod('close_branch'):
          this.strategy = new CloseRestaurantStrategy(newToSet, this.branchId);
          break;

        /* Branch opened */
        case NewsTypeSingleton.idByCod('open_branch'):
          this.strategy = new OpenRestaurantStrategy(newToSet, this.branchId);
          break;

        /* Branch warning */
        case NewsTypeSingleton.idByCod('warning'):
          this.strategy = new WarningRestaurantStrategy(newToSet);
          break;

        /* Platform new order */
        case NewsTypeSingleton.idByCod('new_ord'):
          newToSet.order = data;
          this.strategy = new NewStrategy(newToSet);
          break;

        /* Platform reject order */
        case NewsTypeSingleton.idByCod('platform_rej_ord'):
          newToSet.order = { id: data };
          this.strategy = new PlatformRejectStrategy(newToSet);
          break;
        default:
          const msg = 'No se encontró el tipo de novedad.';
          return Promise.reject(
            new CustomError(APP_BRANCH.SETNEWS, msg, newToSet)
          );
      }
      this.strategy.uuid = this.uuid;
      /* Call the platform async */
      return this.strategy.manageNewType();
    } catch (error) {
      try { 
        logError.create({
            message: 'Falló setNews',
            error:{ error: error.toString(), message: error.message, stack: error.stack, newToSet: newToSet, data: data }
        });
      } catch (ex) {
          logError.create({
              message: 'Falló setNews',
              error: { error: 'Error inesperado en setNews' }
          });
      } 
      const msg = 'No se pudo generar el findQuery o updateQuery.';
      const meta = { ...this.newToSet, error: error.toString() };
      new CustomError(APP_BRANCH.SETNEWS, msg, meta);
    }
  }
}

export default SetNews;
