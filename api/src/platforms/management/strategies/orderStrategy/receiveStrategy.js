import NewsTypeStrategy from '../newsTypeStrategy';
import CustomError from '../../../../utils/errors/customError';
import { APP_BRANCH } from '../../../../utils/errors/codeError';
import NewsTypeSingleton from '../../../../utils/newsType';
import logError from '../../../../models/logError';

class ReceiveStrategy extends NewsTypeStrategy {
  constructor(newToSet) {
    super(newToSet);
    this.savedNew = { _id: newToSet.id };
    this.typeId = NewsTypeSingleton.idByCod('receive_ord');
  }

  findTrace() {
    return this.savedNew.traces.find(
      (trace) =>
        trace.update.typeId == this.newToSet.typeId &&
        trace.update.typeIdPrev == this.newToSet.typeIdPrev &&
        trace.entity == this.entity
    );
  }

  createObjectsUpdate(platformResult, isValid) {
    try {
      this.createTrace(platformResult, isValid);
      this.trace.update.typeIdPrev = this.newToSet.typeIdPrev;
      const findQuery = this.savedNew._id;
      const updateQuery = {
        typeId: this.typeId,
        viewed: new Date(),
        $push: { traces: this.trace }
      };
      const options = {};

      if (!isValid) delete updateQuery.$set.typeId;

      return { findQuery, updateQuery, options };
    } catch (error) {
      try { 
        logError.create({
            message: 'Falló createObjectsUpdate ReceiveStrategy',
            error:{ error: error.toString(), message: error.message, stack: error.stack }
        });
      } catch (ex) {
          logError.create({
              message: 'Falló createObjectsUpdate ReceiveStrategy',
              error: { error: 'Error inesperado en createObjectsUpdate' }
          });
      } 
      const msg = 'No se pudo generar el findQuery o updateQuery.';
      const meta = { ...this.newToSet, error: error.toString() };
      new CustomError(APP_BRANCH.SETNEWS, msg, this.uuid, meta);
    }
  }

  async manageNewType() {
    return new Promise(async (resolve, reject) => {
      try {
        this.savedNew = await this.findNew(this.newToSet.id);
        const isValid = true;
        const platformResult = await this.platform.receiveOrder(
          this.savedNew.order
        );
        const { findQuery, updateQuery, options } = this.createObjectsUpdate(
          platformResult,
          isValid
        );

        await this.updateNew(findQuery, updateQuery, options);
        resolve();
      } catch (error) {
        try { 
          logError.create({
              message: 'Falló manageNewType ReceiveStrategy',
              error:{ error: error.toString(), message: error.message, stack: error.stack }
          });
        } catch (ex) {
            logError.create({
                message: 'Falló manageNewType ReceiveStrategy',
                error: { error: 'Error inesperado en manageNewType' }
            });
        } 
        reject(error);
      }
    });
  }
}

export default ReceiveStrategy;
