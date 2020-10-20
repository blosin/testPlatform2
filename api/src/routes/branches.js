const express = require('express');
const router = express.Router();
const addVersion = require('../middlewares/version-control');
import controller from '../controllers/branch';

router
  .route('/news')
  .get(addVersion, controller.getNews)
  .post(addVersion, controller.setNews);

router.route('/heartbeat').get(controller.getNews);

module.exports = router;
