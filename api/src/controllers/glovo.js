import PlatformFactory from '../platforms/management/factory_platform';
import PlatformSingleton from '../utils/platforms';

function getGlovoInstance() {
  const glovoInternalCode = 9;
  const platformFactory = new PlatformFactory();
  return platformFactory.createPlatform(
    PlatformSingleton.getByCod(glovoInternalCode)
  );
}

/* GET TOKEN FROM HEADERS */
const saveCancelOrder = (req, res) => {
  const glovo = getGlovoInstance();
  const tokenAuth = req.headers.authorization;
  const cancel_reason = req.body.cancel_reason;
  if (!cancel_reason) {
    glovo
      .saveGlovoOrder(req.body, tokenAuth)
      .then((ordersSaved) => res.status(200).send(ordersSaved).end())
      .catch((error) => res.status(400).json(error).end());
  } else {
    glovo
      .rejectPlatformOrder(req.body.order_id)
      .then((cancelOrder) => res.status(200).send(cancelOrder).end())
      .catch((error) => res.status(400).json(error).end());
  }
};

const getOrder = async (req, res) => {
  const glovo = getGlovoInstance();
  glovo
    .getOrderById(req.params.id)
    .then((order) => {
      res.status(200).send(order).end();
    })
    .catch((error) => res.status(400).json({ error }).end());
};

module.exports = {
  getOrder,
  saveCancelOrder
};
