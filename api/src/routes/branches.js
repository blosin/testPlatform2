const express = require('express');
const router = express.Router();
const addVersion = require('../middlewares/version-control');
import controller from '../controllers/branch';

router.route('/news')
    .get(addVersion, controller.getNews)
    .post(addVersion, controller.setNews);

module.exports = router;