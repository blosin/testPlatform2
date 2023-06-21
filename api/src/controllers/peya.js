const getOrder = (req, res) => {
    console.log(req.body);
    return res.status(200).json(
        {
            "remoteResponse": {
                "remoteOrderId": "POS_RESTAURANT_0001_ORDER_000001"
            }
        }
    ).end();
};

const updateOrder = (req, res) => {
    console.log(req.body);
    return res.status(200).json(
            {
                "status": "ORDER_CANCELLED",
                "message": "customer cancelled order"
              }
    ).end();
};

module.exports = {
    getOrder,
    updateOrder
};
