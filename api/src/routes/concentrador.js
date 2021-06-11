const express = require('express');
const router = express.Router();
import controller from '../controllers/concentrador';

router.route('/').post(controller.setInstance);

module.exports = router;
