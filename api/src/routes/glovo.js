const express = require('express');
const router = express.Router();
import controller from '../controllers/glovo';

router.route('/orders')
  .post(controller.saveCancelOrder);

router.route('/orders/:id')
  .get(controller.getOrder);

module.exports = router;
