import NewsStateSingleton from '../../utils/newsState';
import NewsTypeSingleton from '../../utils/newsType';
import CustomError from '../../utils/errors/customError';
import { APP_PLATFORM } from '../../utils/errors/codeError';

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

          const { total_order, other_totals, total_products_with_discount } =
            order.order_detail.totals;
          let paymentNews = {};
          //Se deja online ya que los pagos de rappi son siempre online
          paymentNews.typeId = 2;
          paymentNews.online = true;
          //totalProducts + charges + tip + whims - totalRappiPay - total_products_with_discount
          paymentNews.shipping = 0;
          paymentNews.discount = total_products_with_discount + other_totals.total_rappi_credits;
          paymentNews.voucher = '';
          paymentNews.subtotal = total_order || 0;
          paymentNews.currency = '$';
          paymentNews.remaining = 0;
          paymentNews.partial = 0;
          paymentNews.note = '';
          return paymentNews;

        } catch (error) {
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
          const msg = 'No se pudo parsear la orden de Rappi.';
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
          customer.id = client.id;
          customer.name = client.name;
          customer.address = client.address;
          customer.phone = client.phone;
          customer.email = client.email;
          customer.dni = null;

          return customer;
        } catch (error) {
          const msg = 'No se pudo parsear la orden de Rappi.';
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

      const detailsMapper = (order) => {
        try {

          let details = [];
          let numberOfPromotions = 1;


          for (let detail of order.order_detail.items) {
            let det = {};
            if (
              !!detail.products &&
              !!detail.products.length &&
              detail.type.trim().toLowerCase() == 'combo'
            ) {

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
              det.price = parseFloat(detail.unit_price_without_discount);
              det.promo = 0;
              det.groupId = '0';
              det.discount = 0;
              det.description = detail.name;
              det.note = detail.comments;

              let number = 0;
              det.optionalText = '';
              if (!!detail.toppings)
                for (let topping of detail.toppings) {
                  /* If the product has an item with sku 99999. It's sku is inside toppings */
                  if (detail.sku == '99999') {
                    det.productId = parseInt(topping.sku, 10);
                    det.sku = validationSKU(topping.sku) ? topping.sku : 99999;
                  }
                  if (number == 0) {
                    det.optionalText += topping.name;
                    number += 1;
                  } else {
                    det.optionalText += ', ' + topping.name;
                  }
                }
              details.push(det);
            }
          }

          return details;

        } catch (error) {
          const msg = 'No se pudo parsear la orden de Rappi.';
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
          const msg = 'No se pudo parsear la orden de Rappi.';
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
          const msg = 'No se pudo parsear la orden de Rappi.';
          const err = new CustomError(APP_PLATFORM.CREATE, msg, uuid, {
            data,
            branch,
            error: error.toString()
          });
          reject(err);
        }
      };

      try {


        const totalProducts = data.order.order_detail.items.quantity;
        const totalRappiCredits = data.order.order_detail.totals.other_totals.total_rappi_credits;
        const totalDiscounts = data.order.order_detail.totals.total_products_with_discount;

        let news = {};
        news.viewed = null;
        news.typeId = NewsTypeSingleton.idByCod(newsCode);
        news.branchId = data.branchId;
        let dataOrder = data.order;

        news.order = orderMapper(data, platform);
        news.order.payment = paymentenMapper(dataOrder, data.thirdParty);
        news.order.customer = customerMapper(dataOrder.order_detail.billing_information);
        news.order.driver = driverMapper(dataOrder);
        news.order.details = detailsMapper(dataOrder);
        news.extraData = extraDataMapper(branch, platform);
        //se resta tip para evitar errores de facturacion en sucirsales
        (news.order.totalAmount =
          totalProducts - (totalDiscounts + totalRappiCredits) > 0
            ? totalProducts - (totalDiscounts + totalRappiCredits)
            : 0),
          resolve(news);

      } catch (error) {
        const msg = 'No se pudo parsear la orden de Rappi.';
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

    //Version raapi v1
    // return {
    //   branchReference: data.store.id.toString(),
    //   posId: data.order.id,
    //   originalId: data.order.id.toString(),
    //   displayId: data.order.id.toString()
    // };

  }
};



