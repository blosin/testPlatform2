const express = require('express');
const router = express.Router();
import controller from '../controllers/peya';

router.route('/order/:remoteId').post(controller.getOrder);

router.route('/remoteId/:remoteId/remoteOrder/:remoteOrderId/posOrderStatus').put(controller.updateOrder);

module.exports = router;
