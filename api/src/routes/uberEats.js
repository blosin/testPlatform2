const express = require('express');
const router = express.Router();
import controller from '../controllers/uberEats';

router.route('/tracking')
  .post(controller.getDeliveryInfo);

module.exports = router;
