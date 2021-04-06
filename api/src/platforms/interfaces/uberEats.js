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
          order.orderTime = data.order.placed_at;
          order.deliveryTime = null;
          order.pickupOnShop = false;
          order.pickupDateOnShop = data.order.estimated_ready_for_pickup_at;
          order.preOrder = false;
          order.observations = '';
          order.ownDelivery =
            data.order.type == 'DELIVERY_BY_UBER' ? false : true;
          return order;
        } catch (error) {
          const msg = 'No se pudo parsear la orden de UberEats.';
          const err = new CustomError(APP_PLATFORM.CREATE, msg, uuid, {
            data,
            branch,
            error: error.toString()
          });
          reject(err);
        }
      };

      const paymentenMapper = (order, thirdParty) => {
        try {
          const estimatedShipping =
            data.order.payment.charges.total.amount -
            order.payment.charges.sub_total.amount;
          let paymentNews = {};
          paymentNews.typeId = 2; //Credito
          paymentNews.online = true;
          paymentNews.shipping = parseFloat(estimatedShipping) / 100 || 0;
          paymentNews.discount = 0;
          paymentNews.voucher = '';
          paymentNews.subtotal =
            parseFloat(order.payment.charges.sub_total.amount) / 100;
          paymentNews.currency = '$';
          paymentNews.remaining = 0;
          paymentNews.partial = 0;
          paymentNews.note = '';
          return paymentNews;
        } catch (error) {
          const msg = 'No se pudo parsear la orden de UberEats.';
          const err = new CustomError(APP_PLATFORM.CREATE, msg, uuid, {
            data,
            branch,
            error: error.toString()
          });
          reject(err);
        }
      };

      const driverMapper = (order) => {
        try {
          let driver = null;
          return driver;
        } catch (error) {
          const msg = 'No se pudo parsear la orden de UberEats.';
          const err = new CustomError(APP_PLATFORM.CREATE, msg, uuid, {
            data,
            branch,
            error: error.toString()
          });
          reject(err);
        }
      };

      const customerMapper = (client) => {
        try {
          let customer = {};
          customer.id = 0;
          customer.name = client.first_name + ' ' + client.last_name;
          customer.address = null;
          customer.phone = null;
          customer.email = null;
          customer.dni = null;

          return customer;
        } catch (error) {
          const msg = 'No se pudo parsear la orden de UberEats.';
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
          let numberOfPromotions = 1;
          for (let detail of order) {
            let det = {};
            det.count = detail.quantity;
            det.price = parseFloat(detail.price.unit_price.amount / 100);
            det.promo = 0;
            det.groupId = '0';
            det.discount = 0;
            det.description = detail.title;
            det.note = '';

            const uberSku = parseInt(detail.external_data, 10);
            if (isNaN(uberSku)) uberSku = 99999;
            let tmpSku =
              uberSku >= 90000 && uberSku <= 99999
                ? '99999'
                : uberSku.toString();

            let optionsString = '';

            /* TODO: parser Promo! */
            if (
              detail.selected_modifier_groups != null &&
              detail.selected_modifier_groups.length > 0
            )
              for (let attribute of detail.selected_modifier_groups) {
                attribute.selected_items.forEach((element) => {
                  optionsString +=
                    ' ' + element.title + ' cantidad ' + element.quantity;
                });

                /* If the product has an item with sku 99999. It's sku is inside toppings */
                if (tmpSku == '99999') {
                  tmpSku = attribute.external_data;
                }
              }
            det.productId = parseInt(tmpSku, 10);
            det.sku = tmpSku;
            det.optionalText = optionsString;
            details.push(det);
          }
          return details;
        } catch (error) {
          const msg = 'No se pudo parsear la orden de UberEats.';
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
          return {
            branch: branch.name,
            chain: branch.chain.chain,
            platform: platform.name,
            client: branch.client.businessName,
            region: branch.address.region ? branch.address.region.region : ''
          };
        } catch (error) {
          const msg = 'No se pudo parsear la orden de UberEats.';
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
        let dataOrder = data.order;

        news.order = orderMapper(data, platform);
        news.order.payment = paymentenMapper(dataOrder, data.thirdParty);
        news.order.customer = customerMapper(dataOrder.eater);
        news.order.driver = driverMapper(dataOrder);
        news.order.details = detailsMapper(dataOrder.cart.items);
        news.extraData = extraDataMapper(branch, platform);

        news.order.totalAmount =
          parseFloat(data.order.payment.charges.total.amount) / 100 || 0;
        resolve(news);
      } catch (error) {
        const msg = 'No se pudo parsear la orden de UberEats.';
        const err = new CustomError(APP_PLATFORM.CREATE, msg, uuid, {
          data,
          branch,
          error: error.toString()
        });
        reject(err);
      }
    });
  },
  retriveMinimunData: function (order) {
    return {
      branchReference: order.store.external_reference_id.toString(),
      posId: order.display_id.toString(),
      originalId: order.id.toString(),
      displayId: order.display_id.toString()
    };
  }
};
