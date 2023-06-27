import NewsStateSingleton from '../../utils/newsState';
import NewsTypeSingleton from '../../utils/newsType';
import CustomError from '../../utils/errors/customError';
import { APP_PLATFORM } from '../../utils/errors/codeError';

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
  newsFromOrders: function (data, platform, newsCode, stateCod, branch, uuid) {//cambiar newscode, statecode
    return new Promise((resolve, reject) => {
      const orderMapper = (data, platform) => {
        try {
          let order = {};
          order.id = data.order.token;
          order.originalId = data.order.token;
          order.displayId = data.order.token;
          order.platformId = platform.internalCode;
          order.statusId = NewsStateSingleton.idByCod(stateCod);
          order.orderTime = data.order.createdAt;
          order.deliveryTime = data.order.delivery.expectedDeliveryTime;
          order.pickupOnShop = data.order.pickup;// ver
          order.pickupDateOnShop = data.order.pickup;//VER
          order.preOrder = data.order.preOrder;
          order.observations =
            data.order.comments.customerComment;
          order.ownDelivery = data.order.delivery!==null && data.order.delivery.riderPickupTime === "";
          if (data.order.pickup === null) order.ownDelivery = false;
          return order;
        } catch (error) {
          const msg = 'No se pudo parsear la orden de PY.';
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
          sku != '999999' && sku < 2147483647
        )
          return true;
        return false;
      };

      const paymentenMapper = (payment, discounts, price) => {
        try {
          let paymentNews = {};
          /* Descuentos */
          paymentNews.discount = 0;
          paymentNews.voucher = '';

          discounts.forEach((d, i) => {
            if (i === 0) {
              paymentNews.discount = d.amount;
              paymentNews.voucher = d.name;
            } else {
              paymentNews.discount += d.amount;
              paymentNews.voucher += ` | ${d.notes}`;
            }
          });
          /* Tipo pago - vuelto - pago parcial */
          paymentNews.remaining = 0; /* Vuelto - Inicializado con 0 */
          paymentNews.partial = 0; /* Con cuanto paga - Inicializado con 0 */
          if (payment.type.includes("cash")) {
            paymentNews.typeId = paymentType.Efectivo.paymentId;          
          } else if (
            payment.type.includes("card")
          )
            paymentNews.typeId = paymentType.CREDIT.paymentId;    

          /* Totales */
          paymentNews.online = payment.status === 'paid';
          paymentNews.shipping = 0;
 
          price.deliveryFees.forEach((d, i) => {
            if (i === 0) {
              paymentNews.shipping = d.value;              
            } else {
              paymentNews.shipping += d.value;           
            }
          });
         
          paymentNews.subtotal = price.subTotal; //subtotal;
          paymentNews.currency = '$';
          paymentNews.note = '';
          return paymentNews;
        } catch (error) {
          const msg = 'No se pudo parsear la orden de PY. paymentenMapper';
          const err = new CustomError(APP_PLATFORM.CREATE, msg, uuid, {
            data,
            branch,
            error: error.toString()
          });
          reject(err);
        }
      };

      const customerMapper = (customerRecive) => {
        try {
          let customer = {};
          customer.id = customerRecive.id;
          customer.name = customerRecive.firstName + ' ' + customerRecive.lastName;
          customer.address = null;
          customer.phone = customerRecive.mobilePhone;
          customer.email = customerRecive.email;
          customer.dni = null;
          return customer;
        } catch (error) {
          const msg = 'No se pudo parsear la orden de PY.';
          const err = new CustomError(APP_PLATFORM.CREATE, msg, uuid, {
            data,
            branch,
            error: error.toString()
          });
          reject(err);
        }
      };

      const driverMapper = (retrivedDriver) => {
        try {
          if (!retrivedDriver) return null;
          let driver = {        
            pickUpDatetime: retrivedDriver.riderPickupTime,
            estimatedDeliveryDate: retrivedDriver.expectedDeliveryTime
          };
          return driver;
        } catch (error) {
          const msg = 'No se pudo parsear la orden de PY.';
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
          for (let detail of order.products) {
            let det = {};          
             /* detail.product.section.integrationName.trim().toLowerCase() ==
              'promo'*/// ver promos            
  
              det.productId = detail.id;
              det.count = detail.quantity;
              det.price = detail.paidPrice;
              det.promo = 0;
              det.groupId = '0';
              det.discount = detail.discountAmount;
              det.description = detail.name;
              let skuComparator = validationSKU(detail.integrationCode)
                ? detail.integrationCode
                : 99999;
              det.note = detail.comment;
              det.sku = skuComparator;
              det.optionalText = detail.comment;
              details.push(det);           
          }
          return details;
        } catch (error) {
          console.log('Error', error);
          const msg = 'No se pudo parsear la orden de PY.';
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
            region: branch.address.region ? branch.address.region.region : '',
            country: branch.address.country ? branch.address.country : ''
          };
        } catch (error) {
          const msg = 'No se pudo parsear la orden de PY.';
          const err = new CustomError(APP_PLATFORM.CREATE, msg, uuid, {
            data,
            branch,
            error: error.toString()
          });
          reject(err);
        }
      };

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
        news.typeId = NewsTypeSingleton.idByCod(newsCode);
        news.branchId = data.branchId;

        news.order = orderMapper(data, platform);
        news.order.customer = customerMapper(data.order.customer);
        news.order.details = detailsMapper(data.order);

        news.order.payment = paymentenMapper(
          data.order.payment,
          data.order.discounts,
          data.order.price          
        );
        news.order.driver = driverMapper(data.order.delivery);
        news.extraData = extraDataMapper(branch, platform);
        news.order.totalAmount = data.order.price.grandTotal;
          
        resolve(news);
      } catch (error) {
        const msg = 'No se pudo parsear la orden de PY.';
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
    console.log('***empieza data****');
    console.log(data);
    return {
      branchReference: data.branchId.toString(), //data.restaurant.integrationCode,
      posId: data.id,
      originalId: data.id.toString(),
      displayId: data.id.toString()
    };
  }
};
