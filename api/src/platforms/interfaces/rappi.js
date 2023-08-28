import NewsStateSingleton from '../../utils/newsState';
import NewsTypeSingleton from '../../utils/newsType';
import CustomError from '../../utils/errors/customError';
import { APP_PLATFORM } from '../../utils/errors/codeError';
import logError from '../../models/logError';

const paymentType = {
  debit: {
    paymentId: 1,
    paymentName: 'Debit'
  },
  cc: {
    paymentId: 2,
    paymentName: 'Credit'
  },
  cash: {
    paymentId: 3,
    paymentName: 'Efectivo'
  }
};

module.exports = {
  newsFromOrders: function (data, platform, newsCode, stateCod, branch, uuid) {
    return new Promise((resolve, reject) => {
      const paymentenMapper = (order, thirdParty) => {
        try {
          const {
            total_products_with_discount,
            total_products_without_discount
          } = order.order_detail.totals;
          let paymentNews = {};
          //Se deja online ya que los pagos de rappi son siempre online
          paymentNews.typeId = 2;
          paymentNews.online = true;
          paymentNews.shipping = 0;
          paymentNews.discount =
            total_products_without_discount - total_products_with_discount;
          paymentNews.voucher = '';
          paymentNews.subtotal = total_products_without_discount || 0;
          paymentNews.currency = '$';
          paymentNews.remaining = 0;
          paymentNews.partial = 0;
          paymentNews.note = '';
          return paymentNews;
        } catch (error) {
          try { 
            logError.create({
                message: 'Falló paymentenMapper rappi',
                error:{ error: error.toString(), message: error.message, stack: error.stack}
            });
          } catch (ex) {
              logError.create({
                  message: 'Falló paymentenMapper rappi',
                  error: { error: 'Error inesperado en paymentenMapper rappi' }
              });
          }
          const msg = 'No se pudo parsear la orden de Rappi.1';
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
          try { 
            logError.create({
                message: 'Falló driverMapper rappi',
                error:{ error: error.toString(), message: error.message, stack: error.stack}
            });
          } catch (ex) {
              logError.create({
                  message: 'Falló driverMapper rappi',
                  error: { error: 'Error inesperado en driverMapper rappi' }
              });
          }
          const msg = 'No se pudo parsear la orden de Rappi. 2';
          const err = new CustomError(APP_PLATFORM.CREATE, msg, uuid, {
            data,
            branch,
            error: error.toString()
          });
          reject(err);
        }
      };

      const customerMapper = (client, clientOption) => {
        try {
          let customer = {};

          customer.id = client ? client.id : 1;
          customer.name = client
            ? client.name
            : clientOption
            ? clientOption.first_name
            : 'Sin información';
          customer.address = client ? client.address : 'Sin información';
          customer.phone = client ? client.phone : 'Sin información';
          customer.email = client ? client.email : 'Sin información';
          customer.dni = null;

          return customer;
        } catch (error) {
          try { 
            logError.create({
                message: 'Falló customerMapper rappi',
                error:{ error: error.toString(), message: error.message, stack: error.stack}
            });
          } catch (ex) {
              logError.create({
                  message: 'Falló customerMapper rappi',
                  error: { error: 'Error inesperado en customerMapper rappi' }
              });
          }
          const msg = 'No se pudo parsear la orden de Rappi. 3';
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
          sku != '999999' &&
          sku < 2147483647
        )
          return true;
        return false;
      };

      const detailsMapper = (order) => {
        try {
          let details = [];
          let numberOfPromotions = 1;
          for (let detail of order.order_detail.items) {
            let det = {};
            if (detail.type.trim().toLowerCase() == 'combo') {
              let detHeader = {};
              // creating promo header
              detHeader.productId = parseInt(detail.sku, 10);
              detHeader.count = detail.quantity;
              detHeader.price = parseFloat(detail.unit_price_with_discount);
              detHeader.promo = 2;
              detHeader.groupId = numberOfPromotions;
              detHeader.discount = 0;
              detHeader.description = detail.name;
              detHeader.sku = validationSKU(detail.sku) ? detail.sku : 99999;
              detHeader.note = detail.comments;
              detHeader.canje = 0;

              details.push(detHeader);

              //creating each of  of the promo
              for (let product of detail.subitems) {
                let detDetails = {};
                detDetails.productId = parseInt(product.sku, 10);
                detDetails.promo = 1;
                detDetails.groupId = numberOfPromotions;
                detDetails.description = product.name;
                detDetails.sku = validationSKU(product.sku)
                  ? product.sku
                  : 99999;

                let number = 0;
                detDetails.optionalText = '';

                if (!!product.toppings)
                  for (let topping of product.toppings) {
                    /* If the product has an item with sku 99999. It's sku is inside toppings */
                    if (product.sku == '99999') {
                      detDetails.productId = parseInt(topping.sku, 10);
                      detDetails.sku = validationSKU(topping.sku)
                        ? topping.sku
                        : 99999;
                    }
                    if (number == 0) {
                      detDetails.optionalText += topping.name;
                      number += 1;
                    } else {
                      detDetails.optionalText += ', ' + topping.name;
                    }
                  }

                details.push(detDetails);
              }
              numberOfPromotions += 1;
            } else {
              det.productId = parseInt(detail.sku, 10);
              det.sku = validationSKU(detail.sku) ? detail.sku : 99999;
              det.count = detail.quantity;
              det.price = parseFloat(detail.unit_price_with_discount);
              det.promo = 0;
              det.groupId = '0';
              det.discount = 0;
              det.description = detail.name;
              det.note = detail.comments;

              let number = 0;
              det.optionalText = '';
              if (!!detail.subitems)
                for (let product of detail.subitems) {
                  /* If the product has an item with sku 99999. It's sku is inside toppings */
                  if (product.unit_price_without_discount > 0) {
                    let detDetails = {};
                    detDetails.productId = parseInt(product.sku, 10);
                    detDetails.promo = 0;
                    detDetails.groupId = numberOfPromotions;
                    detDetails.description = product.name;
                    detDetails.sku = validationSKU(product.sku)
                      ? product.sku
                      : 99999;
                    detDetails.price = product.unit_price_with_discount;
                    detDetails.count = product.quantity;
                    let number = 0;
                    detDetails.optionalText = '';

                    if (!!product.subitems)
                      for (let topping of product.subitems) {
                        /* If the product has an item with sku 99999. It's sku is inside toppings */
                        if (product.sku == '99999') {
                          detDetails.productId = parseInt(topping.sku, 10);
                          detDetails.sku = validationSKU(topping.sku)
                            ? topping.sku
                            : 99999;
                        }
                        if (number == 0) {
                          detDetails.optionalText += topping.name;
                          number += 1;
                        } else {
                          detDetails.optionalText += ', ' + topping.name;
                        }
                      }
                    details.push(detDetails);
                  } else {
                    if (detail.sku == '99999') {
                      det.productId = parseInt(product.sku, 10);
                      det.sku = validationSKU(product.sku)
                        ? product.sku
                        : 99999;
                    }
                    if (number == 0) {
                      det.optionalText += product.name;
                      number += 1;
                    } else {
                      det.optionalText += ', ' + product.name;
                    }
                  }
                }
              details.push(det);
            }
          }
          return details;
        } catch (error) {
          try { 
            logError.create({
                message: 'Falló detailsMapper rappi',
                error:{ error: error.toString(), message: error.message, stack: error.stack}
            });
          } catch (ex) {
              logError.create({
                  message: 'Falló detailsMapper rappi',
                  error: { error: 'Error inesperado en detailsMapper rappi' }
              });
          }
          const msg = 'No se pudo parsear la orden de Rappi. 4';
          const err = new CustomError(APP_PLATFORM.CREATE, msg, uuid, {
            data,
            branch,
            error: error.toString()
          });
          reject(err);
        }
      };

      const orderMapper = (data, platform) => {
        try {
          let order = {};
          order.id = data.posId;
          order.originalId = data.originalId;
          order.displayId = data.displayId;
          order.platformId = platform.internalCode;
          order.statusId = NewsStateSingleton.idByCod(stateCod);
          order.orderTime = data.order.order_detail.createdAt;
          order.deliveryTime = null;
          order.pickupOnShop = false;
          order.pickupDateOnShop = null;
          order.preOrder = false;
          order.observations = '';
          order.ownDelivery = false;
          return order;
        } catch (error) {
          try { 
            logError.create({
                message: 'Falló orderMapper rappi',
                error:{ error: error.toString(), message: error.message, stack: error.stack}
            });
          } catch (ex) {
              logError.create({
                  message: 'Falló orderMapper rappi',
                  error: { error: 'Error inesperado en orderMapper rappi' }
              });
          }
          const msg = 'No se pudo parsear la orden de Rappi. 5';
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
          try { 
            logError.create({
                message: 'Falló extraDataMapper rappi',
                error:{ error: error.toString(), message: error.message, stack: error.stack}
            });
          } catch (ex) {
              logError.create({
                  message: 'Falló extraDataMapper rappi',
                  error: { error: 'Error inesperado en extraDataMapper rappi' }
              });
          }
          const msg = 'No se pudo parsear la orden de Rappi. 6';
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
        news.order.customer = customerMapper(
          dataOrder.order_detail.billing_information,
          dataOrder.customer
        );
        news.order.driver = driverMapper(dataOrder);
        news.order.details = detailsMapper(dataOrder);
        news.extraData = extraDataMapper(branch, platform);
        //se resta tip para evitar errores de facturacion en sucirsales
        news.order.totalAmount =
          data.order.order_detail.totals.total_products_with_discount;
        resolve(news);
      } catch (error) {
        try { 
          logError.create({
              message: 'Falló extraDataMapper rappi 2',
              error:{ error: error.toString(), message: error.message, stack: error.stack}
          });
        } catch (ex) {
            logError.create({
                message: 'Falló extraDataMapper rappi 2',
                error: { error: 'Error inesperado en extraDataMapper rappi' }
            });
        }
        const msg = 'No se pudo parsear la orden de Rappi. 7';
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
      branchReference: data.store.external_id.toString(),
      posId: data.order_detail.order_id,
      originalId: data.order_detail.order_id.toString(),
      displayId: data.order_detail.order_id.toString()
    };
  }
};
