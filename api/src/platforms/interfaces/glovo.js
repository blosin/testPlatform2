import NewsStateSingleton from '../../utils/newsState';
import NewsTypeSingleton from '../../utils/newsType';
import logError from '../../models/logError';

const paymentType = {
  DEBIT: {
    paymentId: 1,
    paymentName: 'Debit'
  },
  CREDIT: {
    paymentId: 2,
    paymentName: 'Credit'
  },
  Efectivo: {
    paymentId: 3,
    paymentName: 'Efectivo'
  }
};

module.exports = {
  newsFromOrders: function (data, platform, newsCode, stateCod, branch, uuid) {
    return new Promise((resolve, reject) => {
      try {
        let news = {
          order: {
            customer: {},
            details: [],
            payment: {},
            totalAmount: {},
            driver: []
          }
        };
        news.viewed = null;

        let orderMapper = (data, platform) => {
          let order = {};
          order.id = data.posId;
          order.originalId = data.originalId;
          order.displayId = data.displayId;
          order.platformId = platform.internalCode;
          order.statusId = NewsStateSingleton.idByCod(stateCod);
          order.orderTime = data.order.order_time ? data.order.order_time : 0;
          order.pickupDateOnShop = data.order.estimated_pickup_time;
          order.observations = data.order.allergy_info;

          //Glovo don't send this atributes
          order.deliveryTime = null;
          order.pickupOnShop = data.order.is_picked_up_by_customer || false;
          order.preOrder = false;
          order.ownDelivery = false;
          return order;
        };

        let paymentenMapper = (payment) => {
          let paymentNews = {};
          const estimated_total_price = payment.estimated_total_price
            ? parseFloat(payment.estimated_total_price / 100)
            : 0;
          const customer_cash_payment_amount =
            payment.customer_cash_payment_amount
              ? parseFloat(payment.customer_cash_payment_amount / 100)
              : 0;
          const delivery_fee = payment.delivery_fee
            ? parseFloat(payment.delivery_fee / 100)
            : 0;

          if (
            payment.payment_method == 'CASH' ||
            payment.payment_method == 'DELAYED'
          ) {
            paymentNews.typeId = paymentType.Efectivo.paymentId;
            paymentNews.online = false;
          } else {
            paymentNews.typeId = paymentType.CREDIT.paymentId;
            paymentNews.online = true;
          }

          paymentNews.shipping = delivery_fee;
          paymentNews.subtotal = estimated_total_price;
          paymentNews.discount = 0;
          paymentNews.voucher = 0;

          paymentNews.currency = '?';
          if (payment.currency == 'ARS') paymentNews.currency = '$';
          else if (payment.currency == 'EUR') paymentNews.currency = '€';

          paymentNews.remaining =
            customer_cash_payment_amount - estimated_total_price;
          if (customer_cash_payment_amount == 0) paymentNews.remaining = 0;

          paymentNews.partial = 0;
          paymentNews.note = '';
          return paymentNews;
        };

        let customerMapper = (orderCustomer, address) => {
          let customer = {};
          customer.id = 0;
          customer.name = orderCustomer.name ? orderCustomer.name : '';
          if (
            address != null &&
            (address.label != undefined || address.label != null)
          ) {
            customer.address = address.label;
          } else {
            customer.address = '';
          }
          customer.phone = orderCustomer.phone_number
            ? orderCustomer.phone_number
            : '';
          customer.email = '-';
          customer.dni = null;
          return customer;
        };

        let detailsMapper = (order) => {
          let details = [];
          let numberOfPromotions = 1;
          for (let detail of order.products) {
            let det = {};
            det.count = detail.quantity;
            det.price = parseFloat(detail.price / 100);
            det.promo = 0;
            det.groupId = '0';
            det.discount = 0;
            det.description = detail.name;
            det.note = '';

            const glovoSku = parseInt(detail.id, 10);
            let tmpSku;
            //If glovoSku isNaN transform it to -1
            if (isNaN(glovoSku)) tmpSku = '-1';
            else
              tmpSku =
                glovoSku >= 90000 && glovoSku <= 99999
                  ? '99999'
                  : glovoSku.toString();

            let optionsString = '';
            if (detail.attributes.length > 0)
              for (let attribute of detail.attributes) {
                optionsString +=
                  ' ' + attribute.name + ' X ' + attribute.quantity;
                /* If the product has an item with sku 99999. It's sku is inside toppings */
                if (tmpSku == '99999') {
                  tmpSku = attribute.id;
                }
              }
            det.productId = parseInt(tmpSku, 10);
            det.sku = tmpSku;
            det.optionalText = optionsString;
            details.push(det);
          }
          return details;
        };

        let driverMapper = (retrivedDriver) => {
          if (!retrivedDriver) return null;
          let driver = {
            name: retrivedDriver.name ? retrivedDriver.name : '',
            phone: retrivedDriver.phone_number
              ? retrivedDriver.phone_number
              : ''
          };
          return driver;
        };

        news.typeId = NewsTypeSingleton.idByCod(newsCode);
        news.branchId = data.branchId;
        news.extraData = {
          branch: branch.name,
          chain: branch.chain.chain,
          platform: platform.name,
          client: branch.client.businessName,
          region: branch.address.region ? branch.address.region.region : '',
          country: branch.address.country ? branch.address.country : ''
        };
        news.order = orderMapper(data, platform);
        news.order.details = detailsMapper(data.order);
        news.order.payment = paymentenMapper(data.order);
        news.order.customer = customerMapper(
          data.order.customer,
          data.order.delivery_address
        );
        news.order.driver = driverMapper(data.order.courier);
        news.order.totalAmount = data.order.estimated_total_price
          ? parseFloat(data.order.estimated_total_price / 100)
          : 0;
        resolve(news);
      } catch (error) {
        try { 
          logError.create({
              message: 'Falló glovo',
              error:{ error: error.toString(), message: error.message, stack: error.stack}
          });
        } catch (ex) {
            logError.create({
                message: 'Falló glovo',
                error: { error: 'Error inesperado en glovo' }
            });
        }
        reject(error);
      }
    });
  },
  retriveMinimunData: function (data) {
    return {
      branchReference: data.store_id,
      posId: parseInt(data.order_id, 10),
      originalId: data.order_id,
      displayId: data.order_order_Idcode
    };
  }
};
