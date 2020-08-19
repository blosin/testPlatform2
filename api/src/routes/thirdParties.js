const express = require('express');
const router = express.Router();
import controller from '../controllers/thirdParty';

router.route('/login')
  .post(controller.login);

router.route('/orders')
  .post(controller.saveOrder);

router.route('/orders/:id')
  .get(controller.findOrder); 

router.route('/orders/cancel')
  .post(controller.cancelOrder);

router.route('/:id')
  .get(controller.findById)
  .put(controller.updateOne)
  .delete(controller.deleteOne);

router.route('/')
  .get(controller.findAll)
  .post(controller.saveOne);

module.exports = router;
