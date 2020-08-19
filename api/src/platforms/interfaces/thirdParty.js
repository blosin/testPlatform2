import NewsStateSingleton from '../../utils/newsState';
import NewsTypeSingleton from '../../utils/newsType';
import CustomError from '../../utils/errors/customError';
import { APP_PLATFORM } from '../../utils/errors/codeError';

module.exports = {
    newsFromOrders: function (data, platform, newsCode, stateCod, branch, uuid) {
        return new Promise((resolve, reject) => {
            const paymentenMapper = (payment) => {
                try {
                    let paymentNews = {};
                    paymentNews.typeId = 3; //Efectivo
                    paymentNews.online = payment.online;
                    paymentNews.shipping = payment.shipping ? payment.shipping : 0;
                    paymentNews.discount = payment.discount ? payment.discount : 0;
                    paymentNews.voucher = payment.voucher ? payment.voucher : '';
                    paymentNews.subtotal = payment.subtotal;
                    paymentNews.currency = '$';
                    paymentNews.remaining = payment.paymentAmount;
                    paymentNews.partial = payment.partial;
                    paymentNews.note = '';
                    return paymentNews;
                } catch (error) {
                    const msg = 'No se pudo parsear la orden de un ThirdParty.';
                    const err = new CustomError(APP_PLATFORM.CREATE, msg, uuid, { data, branch, error: error.toString() });
                    reject(err);
                }
            }

            const driverMapper = (order) => {
                try {
                    let driver = null;
                    return driver;
                } catch (error) {
                    const msg = 'No se pudo parsear la orden de un ThirdParty.';
                    const err = new CustomError(APP_PLATFORM.CREATE, msg, uuid, { data, branch, error: error.toString() });
                    reject(err);
                }
            }

            const extraDataMapper = (branch, platform) => {
                try {
                    return {
                        branch: branch.name,
                        chain: branch.chain.chain,
                        platform: platform.name,
                        client: branch.client.businessName,
                        region: branch.address.region ? branch.address.region.region : ""
                    };
                } catch (error) {
                    const msg = 'No se pudo parsear la orden de un ThirdParty.';
                    const err = new CustomError(APP_PLATFORM.CREATE, msg, uuid, { data, branch, error: error.toString() });
                    reject(err);
                }
            };

            try {
                let news = { order: { customer: {}, details: [], payment: {}, totalAmount: {}, driver: [] } };
                news.viewed = null;

                news.typeId = NewsTypeSingleton.idByCod(newsCode);
                news.branchId = data.branchId;

                news.order.id = data.order.id;
                news.order.originalId = data.order.id;
                news.order.platformId = platform.internalCode;
                news.order.statusId = NewsStateSingleton.idByCod(stateCod);
                news.order.orderTime = data.order.registeredDate;
                news.order.deliveryTime = data.order.deliveryDate;
                news.order.pickupOnShop = data.order.pickup;
                news.order.pickupDateOnShop = data.order.pickupDate;
                news.order.preOrder = data.order.preOrder;
                news.order.observations = data.order.notes;
                news.order.ownDelivery = data.order.logistics;

                if (data.order.pickup)
                    news.order.ownDelivery = false;

                news.order.customer.name = data.order.user.name + ' ' + data.order.user.lastName;
                news.order.customer.address = data.order.address.description;
                news.order.customer.phone = data.order.address.phone;
                news.order.customer.id = data.order.user.id;
                news.order.customer.dni = data.order.user.dni;
                news.order.customer.email = data.order.user.email;

                let groupId = 1;
                news.order.details = [];
                for (let detail of data.order.details) {
                    let det = {};
                    det.productId = detail.id;
                    det.count = detail.quantity;
                    det.price = detail.unitPrice;
                    det.discount = detail.discount;
                    det.description = detail.name;
                    det.sku = detail.sku;
                    det.optionalText = detail.notes;
                    det.promo = 0;
                    det.promotion = false;
                    det.groupId = 0;

                    if (detail.promotion &&
                        !!detail.optionGroups &&
                        !!detail.optionGroups.length) {
                        det.promo = 2;
                        det.groupId = groupId;
                        news.order.details.push(det);

                        for (let option of detail.optionGroups) {
                            let optionalDet = {};
                            optionalDet.promo = 1;
                            optionalDet.productId = option.id;
                            optionalDet.groupId = groupId;
                            optionalDet.description = option.name;
                            optionalDet.sku = option.sku;
                            optionalDet.optionalText = option.notes;
                            optionalDet.count = option.quantity || 1;
                            news.order.details.push(optionalDet);
                        }
                        groupId++;
                    } else {
                        news.order.details.push(det);
                    }
                }

                news.order.payment = paymentenMapper(data.order.payment[0]);
                news.order.driver = driverMapper(data.order);
                news.order.totalAmount = data.order.payment[0].subtotal;
                news.extraData = extraDataMapper(branch, platform);

                resolve(news);
            } catch (error) {
                const msg = 'No se pudo parsear la orden de un ThirdParty.';
                const err = new CustomError(APP_PLATFORM.CREATE, msg, uuid, { data, branch, error: error.toString() });
                reject(err);
            }

        });
    },
    retriveMinimunData: function (data) {
        return {
            branchReference: parseInt(data.branchId, 10),
            id: data.id
        }
    }
}