import NewsTypeStrategy from '../newsTypeStrategy';
import RejectedMessagesSingleton from '../../../../utils/rejectedMessages';
import NewsStateSingleton from '../../../../utils/newsState';
import news from '../../../../models/news';
import NewsTypeSingleton from '../../../../utils/newsType';
import Aws from '../../../../platforms/provider/aws';
import branch from '../../../../models/branch';
import PlatformController from '../../platform';

class PlatformRejectStrategy extends NewsTypeStrategy {
  constructor(newToSet) {
    super(newToSet);
    this.order = newToSet.order;
    this.entity = 'PLATFORM';
    this.typeId = NewsTypeSingleton.idByCod('platform_rej_ord');
    this.statusId = NewsStateSingleton.idByCod('rej');
  }

  validateTransition() {
    const posiblePrevStatus = [
      NewsStateSingleton.idByCod('pend'),
      NewsStateSingleton.idByCod('view'),
      NewsStateSingleton.idByCod('confirm'),
      NewsStateSingleton.idByCod('dispatch')
    ];
    const prevStatusOk = posiblePrevStatus.some(
      (s) => s === this.savedNew.order.statusId
    );
    return prevStatusOk && !this.findTrace(this.typeId);
  }

  async manageNewType() {
    return new Promise(async (resolve, reject) => {
      try {
        const closed_rejId =
          RejectedMessagesSingleton.closedResRejectedMessages.id;
        this.savedNew = await news.find({ 'order.id': this.order.id }).lean();
        this.savedNew = this.savedNew.pop();
        if (
          !!this.savedNew &&
          !!this.savedNew.extraData &&
          !!this.savedNew.extraData.rejected &&
          this.savedNew.extraData.rejected.rejectMessageId !== closed_rejId
        )
          throw {
            orderId: this.order.id,
            error: `The order ${this.order.id} could not be found.`
          };

        this.createPlatform(this.savedNew.order.platformId);
        const isValid = this.validateTransition();

        let platformResult = null;
        if (isValid) {
          platformResult = await this.platform.rejectPlatformOrder(
            this.savedNew.order.id
          );
        }
        const { findQuery, updateQuery, options } = this.createObjectsUpdate(
          platformResult,
          isValid
        );
        const rej = RejectedMessagesSingleton.platformRejectedMessages;

        const rejectedExtraData = {
          rejectMessageId: rej.id,
          rejectMessageDescription: rej.name,
          rejectMessageNote: null,
          entity: 'PLATFORM'
        };
        if (isValid) {
          updateQuery.viewed = null;
          updateQuery['extraData.rejected'] = rejectedExtraData;
        }
        const result = await this.updateNew(findQuery, updateQuery, options);
        const aws = new Aws();

        const searchBranch = (
          await branch.find({ branchId: this.savedNew.branchId }).lean()
        ).pop();
        const platformController = new PlatformController();

        const isOpened = await platformController.isClosedRestaurant(
          searchBranch.platforms,
          searchBranch.lastGetNews
        );

        if (
          isOpened &&
          searchBranch.platforms[0].isActive &&
          parseFloat(searchBranch.smartfran_sw.agent.installedVersion) > 1.24
        ) {
          //Push all savedNews to the queue
          await aws.pushNewToQueue(result);
        }
        if (!isValid)
          return reject({
            orderId: this.order.id,
            error: `The order ${this.order.id} has reached it final status.`
          });
        return resolve(platformResult);
      } catch (error) {
        return reject(error);
      }
    });
  }
}

export default PlatformRejectStrategy;
