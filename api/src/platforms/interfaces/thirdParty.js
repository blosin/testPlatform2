import NewsStateSingleton from '../../utils/newsState';
import NewsTypeSingleton from '../../utils/newsType';
import CustomError from '../../utils/errors/customError';
import { APP_PLATFORM } from '../../utils/errors/codeError';

module.exports = {
  newsFromOrders: function (data, platform, newsCode, stateCod, branch, uuid) {
    return new Promise((resolve, reject) => {
      const orderMapper = (data, platform) => {
        try {
          let order = {};
          order.id = data.posId;
          order.originalId = data.originalId;
          order.displayId = data.displayId;
          order.platformId = platform.internalCode;
          order.statusId = NewsStateSingleton.idByCod(stateCod);
          order.orderTime = data.order.registeredDate;
          order.deliveryTime = data.order.deliveryDate;
          order.pickupOnShop = data.order.pickup;
          order.pickupDateOnShop = data.order.pickupDate;
          order.preOrder = data.order.preOrder;
          order.observations = data.order.notes;
          order.ownDelivery = data.order.logistics;
          if (data.order.pickup) order.ownDelivery = false;

          return order;
        } catch (error) {
          const msg = 'No se pudo parsear la orden del ThirdParty.';
          const err = new CustomError(APP_PLATFORM.CREATE, msg, uuid, {
            data,
            branch,
            error: error.toString()
          });
          reject(err);
        }
      };

      const paymentenMapper = (payment) => {
        try {
          let paymentNews = {};
          paymentNews.typeId = payment.online ? 2 : 3; //Credito o Efectivo
          paymentNews.online = payment.online;
          paymentNews.shipping = payment.shipping || 0;
          paymentNews.discount = payment.discount || 0;
          paymentNews.voucher = payment.voucher || '';
          paymentNews.subtotal = payment.subtotal || 0;
          paymentNews.currency = '$';
          paymentNews.remaining = payment.paymentAmount || 0;
          paymentNews.partial = payment.partial || 0;
          paymentNews.note = '';
          return paymentNews;
        } catch (error) {
          const msg = 'No se pudo parsear la orden de un ThirdParty.';
          const err = new CustomError(APP_PLATFORM.CREATE, msg, uuid, {
            data,
            branch,
            error: error.toString()
          });
          reject(err);
        }
      };

      const validationSKU = (sku) => {
        if (
          (sku == null || sku.match(/[A-Za-z]/g) === null) &&
          sku != '9999' &&
          sku != '999999'
        )
          return true;
        return false;
      };

      const driverMapper = (order) => {
        try {
          let driver = null;
          return driver;
        } catch (error) {
          const msg = 'No se pudo parsear la orden de un ThirdParty.';
          const err = new CustomError(APP_PLATFORM.CREATE, msg, uuid, {
            data,
            branch,
            error: error.toString()
          });
          reject(err);
        }
      };

      const extraDataMapper = (branch, platform) => {
        try {
          console.log(branch);
          return {
            branch: branch.name,
            chain: branch.chain.chain,
            platform: platform.name,
            client: branch.client.businessName,
            region: branch.address.region ? branch.address.region.region : '',
            country: branch.address.country ? branch.address.country : ''
          };
        } catch (error) {
          const msg = 'No se pudo parsear la orden de un ThirdParty.';
          const err = new CustomError(APP_PLATFORM.CREATE, msg, uuid, {
            data,
            branch,
            error: error.toString()
          });
          reject(err);
        }
      };

      const customerMapper = (order) => {
        try {
          let customer = {};
          customer.name = order.user.name + ' ' + order.user.lastName;
          customer.address = order.address.description;
          customer.phone = order.address.phone;
          customer.id =
            !order.user.id ||
            order.user.id == 'null' ||
            typeof order.user.id !== 'number'
              ? 0
              : order.user.id;
          customer.dni = order.user.dni;
          customer.email = order.user.email;
          return customer;
        } catch (error) {
          const msg = 'No se pudo parsear la orden de ThirdParty.';
          const err = new CustomError(APP_PLATFORM.CREATE, msg, uuid, {
            data,
            branch,
            error: error.toString()
          });
          reject(err);
        }
      };

      const detailsMapper = (order) => {
        try {
          let details = [];
          let groupId = 1;
          for (let detail of order.details) {
            let det = {};
            det.productId = detail.id;
            det.count = detail.quantity;
            det.price = detail.unitPrice;
            det.discount = detail.discount;
            det.description = detail.name;
            det.sku = validationSKU(detail.sku) ? detail.sku : 99999;
            det.optionalText = detail.notes;
            det.promo = 0;
            det.promotion = false;
            det.groupId = 0;

            if (
              detail.promotion &&
              !!detail.optionGroups &&
              !!detail.optionGroups.length
            ) {
              det.promo = 2;
              det.groupId = groupId;
              details.push(det);

              for (let option of detail.optionGroups) {
                let optionalDet = {};
                optionalDet.promo = 1;
                optionalDet.productId = option.id;
                optionalDet.groupId = groupId;
                optionalDet.description = option.name;
                optionalDet.sku = validationSKU(option.sku)
                  ? option.sku
                  : 99999;
                optionalDet.optionalText = option.notes;
                optionalDet.count = option.quantity || 1;
                details.push(optionalDet);
              }
              groupId++;
            } else {
              details.push(det);
            }
          }
          return details;
        } catch (error) {
          const msg = 'No se pudo parsear la orden de ThirdParty.';
          const err = new CustomError(APP_PLATFORM.CREATE, msg, uuid, {
            data,
            branch,
            error: error.toString()
          });
          reject(err);
        }
      };
      try {
        let news = {};
        news.viewed = null;
        news.typeId = NewsTypeSingleton.idByCod(newsCode);
        news.branchId = data.branchId;

        news.order = orderMapper(data, platform);
        news.order.customer = customerMapper(data.order);
        news.order.details = detailsMapper(data.order);
        news.order.payment = paymentenMapper(data.order.payment[0]);
        news.order.driver = driverMapper(data.order);
        news.extraData = extraDataMapper(branch, platform);
        news.order.totalAmount =
          data.order.payment[0].subtotal -
          (data.order.payment[0].discount ? data.order.payment[0].discount : 0);
        resolve(news);
      } catch (error) {
        const msg = 'No se pudo parsear la orden de un ThirdParty.';
        const err = new CustomError(APP_PLATFORM.CREATE, msg, uuid, {
          data,
          branch,
          error: error.toString()
        });
        reject(err);
      }
    });
  },
  retriveMinimunData: function (data) {
    return {
      branchReference: data.branchId.toString(),
      posId: data.id,
      originalId: data.id.toString(),
      displayId: data.id.toString()
    };
  }
};
