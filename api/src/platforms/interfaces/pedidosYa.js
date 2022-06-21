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
  newsFromOrders: function (data, platform, newsCode, stateCod, branch, uuid) {
    return new Promise((resolve, reject) => {
      const orderMapper = (data, platform) => {
        try {
          let order = {};
          order.id = data.order.id;
          order.originalId = data.order.id;
          order.displayId = data.order.id;
          order.platformId = platform.internalCode;
          order.statusId = NewsStateSingleton.idByCod(stateCod);
          order.orderTime = data.order.registeredDate;
          order.deliveryTime = data.order.deliveryDate;
          order.pickupOnShop = data.order.pickup;
          order.pickupDateOnShop = data.order.pickupDate;
          order.preOrder = data.order.preOrder;
          order.observations =
            data.order.user.company.name && data.order.user.company.document
              ? `SOLICITA FACTURA LEGAL: ${data.order.user.company.name} - CIC/CI/RUC: ${data.order.user.company.document}`
              : data.order.notes;
          order.ownDelivery = !data.order.logistics;
          if (data.order.pickup) order.ownDelivery = false;
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

      const paymentenMapper = (payment, discounts, thirdParty) => {
        try {
          let paymentNews = {};
          /* Descuentos */
          paymentNews.discount = 0;
          paymentNews.voucher = '';
          discounts.forEach((d, i) => {
            if (i === 0) {
              paymentNews.discount = d.amount;
              paymentNews.voucher = d.notes;
            } else {
              paymentNews.discount += d.amount;
              paymentNews.voucher += ` | ${d.notes}`;
            }
          });
          /* Tipo pago - vuelto - pago parcial */
          paymentNews.remaining = 0; /* Vuelto - Inicializado con 0 */
          paymentNews.partial = 0; /* Con cuanto paga - Inicializado con 0 */
          if (!payment.online) {
            paymentNews.typeId = paymentType.Efectivo.paymentId;
            paymentNews.remaining =
              payment.paymentAmount -
              payment.subtotal +
              paymentNews.discount; /* Vuelto - Si el pago es efectivo, calculo vuelto*/
            paymentNews.partial =
              payment.paymentAmount; /* Con cuanto paga - Si el pago es efectivo, indica con cuanto paga*/
          } else if (
            !!payment.card &&
            !!payment.card.operationType &&
            !!paymentType[payment.card.operationType]
          )
            paymentNews.typeId =
              paymentType[payment.card.operationType].paymentId;
          else paymentNews.typeId = paymentType.CREDIT.paymentId;

          /* Totales */
          paymentNews.online = payment.online;
          paymentNews.shipping = payment.shippingNoDiscount;
          paymentNews.subtotal = payment.subtotal;
          paymentNews.currency = payment.currencySymbol;
          paymentNews.note = payment.notes;
          return paymentNews;
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

      const customerMapper = (order) => {
        try {
          let customer = {};
          customer.id = order.user.id;
          customer.name = order.user.name + ' ' + order.user.lastName;
          customer.address = order.address.description;
          customer.phone = order.address.phone;
          customer.email = order.user.email;
          customer.dni = order.user.identityCard;
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
            name: retrivedDriver.name,
            status: retrivedDriver.status,
            pickUpDatetime: retrivedDriver.pickUpDatetime,
            estimatedDeliveryDate: retrivedDriver.estimatedDeliveryDate
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
          let numberOfPromotions = 1;
          for (let detail of order.details) {
            let det = {};
            if (
              detail.product.section.integrationName.trim().toLowerCase() ==
              'promo'
            ) {
              let detHeader = {};
              // creating promo header
              detHeader.productId = detail.product.id;
              detHeader.count = detail.quantity;
              detHeader.price = detail.unitPrice;
              detHeader.promo = 2;
              detHeader.groupId = numberOfPromotions;
              detHeader.discount = detail.discount;
              detHeader.description = detail.product.name;
              detHeader.sku = validationSKU(detail.product.integrationCode)
                ? detail.product.integrationCode
                : 99999;
              detHeader.note = detail.notes;
              detHeader.canje = 0;

              details.push(detHeader);

              //creating each of the details of the promo
              for (let optionsGroups of detail.optionGroups) {
                let detDetails = {};
                detDetails.productId = optionsGroups.id;
                detDetails.promo = 1;
                detDetails.groupId = numberOfPromotions;
                detDetails.description = optionsGroups.name;

                let skuComparator = validationSKU(optionsGroups.integrationCode)
                  ? optionsGroups.integrationCode
                  : 99999;

                let optionsString = '';
                if (!!optionsGroups.options.length)
                  for (let option of optionsGroups.options) {
                    if (option.integrationCode === '99999') {
                      optionsString +=
                        ' ' + option.name + ' X ' + option.quantity;
                    } else {
                      skuComparator = validationSKU(option.integrationCode)
                        ? option.integrationCode
                        : 99999;
                      optionsString = option.name;
                      detDetails.sku = skuComparator;
                      detDetails.optionalText = optionsString;
                      detDetails.count = option.quantity;
                      if (option.amount > 0) detDetails.price = option.amount;
                      const optionDetail = Object.assign({}, detDetails);
                      details.push(optionDetail);
                    }
                  }

                //Si son iguales es porque los options unicamente tenia sabores
                if (optionsGroups.integrationCode === skuComparator) {
                  detDetails.sku = skuComparator;
                  detDetails.optionalText = optionsString;
                  details.push(detDetails);
                }
              }
              numberOfPromotions += 1;
            } else {
              det.productId = detail.product.id;
              det.count = detail.quantity;
              det.price = detail.unitPrice;
              det.promo = 0;
              det.groupId = '0';
              det.discount = detail.discount;
              det.description = detail.product.name;
              let skuComparator = validationSKU(detail.product.integrationCode)
                ? detail.product.integrationCode
                : 99999;
              det.note = detail.notes;
              let adicional = [];
              let optionsString = '';
              if (detail.optionGroups.length > 0) {
                for (let optionsGroups of detail.optionGroups) {
                  if (
                    optionsGroups.integrationName.trim().toLowerCase() ==
                    'adicional'
                  ) {
                    for (let options of optionsGroups.options) {
                      let det = {};

                      det.sku = validationSKU(options.integrationCode)
                        ? options.integrationCode
                        : 99999;
                      det.productId = options.id;
                      det.count = options.quantity;
                      det.price = options.amount;
                      det.promo = 0;
                      det.groupId = '0';
                      det.discount = 0;
                      det.description = optionsGroups.name;
                      det.optionalText = options.name;
                      adicional.push(det);
                    }
                  } else {
                    optionsString += ' ' + optionsGroups.name;

                    for (let options of optionsGroups.options) {
                      if (
                        options.integrationCode &&
                        options.integrationCode != '' &&
                        options.integrationCode != '99999'
                      ) {
                        skuComparator = validationSKU(options.integrationCode)
                          ? options.integrationCode
                          : 99999;
                        optionsString += ' ' + options.name;
                      } else {
                        optionsString +=
                          ' ' + options.name + ' X ' + options.quantity;
                      }
                    }
                  }
                }
              }

              det.sku = skuComparator;
              det.optionalText = optionsString;
              details.push(det);
              adicional.forEach((det) => {
                details.push(det);
              });
            }
          }
          return details;
        } catch (error) {
          console.log('-erreEE', error);
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
        news.order.customer = customerMapper(data.order);
        news.order.details = detailsMapper(data.order);
        news.order.payment = paymentenMapper(
          data.order.payment,
          data.order.discounts,
          data.thirdParty
        );
        news.order.driver = driverMapper(data.driver);
        news.extraData = extraDataMapper(branch, platform);
        news.order.totalAmount =
          data.order.payment.subtotal - news.order.payment.discount;

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
    return {
      branchReference: data.restaurant.integrationCode,
      posId: data.id,
      originalId: data.id.toString(),
      displayId: data.id.toString()
    };
  }
};
