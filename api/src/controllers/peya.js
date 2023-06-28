import PlatformFactory from '../platforms/management/factory_platform';
import SetNews from '../platforms/management/strategies/set-news';
import PlatformSingleton from '../utils/platforms';
import { isArray } from 'lodash';
import NewsTypeSingleton from '../utils/newsType';


const saveOrder = (req, res) => {
    /* TODO: VALIDATE DATA TYPE OF INPUT */
    req.body.branchId = req.params.remoteId;
    req.body.state = "PENDING";

    const platform = initPlatform(113, req.uuid);

    //verifica si la plataforma esta activa en backoffice
    if (platform._platform.active != undefined && !platform._platform.active) {
        const msg = 'Platform not active';
        res.status(200).json({ error: msg }).end();
    }

    if (isArray(req.body)) {
        req.body.forEach(async (data) => {
            let result = await req.body.filter((filtro) => filtro.id === data.id);
            if (result.length > 1)
                return res
                    .status(400)
                    .json({
                        error: `The array has more than one order with the id:${data.id}`
                    })
                    .end();            
        });
        const resultProm = req.body.map((data) => platform.validateNewOrders(data));
        Promise.all(resultProm)
            .then((resultPromise) => {
                res.status(200).json(
                    {
                        "remoteResponse": {
                            "remoteOrderId": req.body.token
                        }
                    }
                ).end();
                //res.status(200).send(resultPromise).end();
            })
            .catch((error) => {
                res.status(400).json(error).end();
            });
    } else
        platform
            .validateNewOrders(req.body)
            .then((ordersSaved) => {
                res.status(200).json(
                    {
                        "remoteResponse": {
                            "remoteOrderId": req.body.token
                        }
                    }
                ).end();
                // res.status(200).send(ordersSaved).end();
            })
            .catch((error) => res.status(400).json(error).end());
};

const updateOrder = async (req, res) => {
    try {
        if (!req.params.remoteOrderId || !req.params.remoteId) {
            const msg = 'Insuficient parameters.';
            logger.error({ message: msg, meta: { body: req.body } });
            return res.status(400).json({ error: msg }).end();
        }

        const setNews = new SetNews(req.token);

        let newToSet = { typeId: NewsTypeSingleton.idByCod('platform_rej_ord') };

        const result = await setNews.setNews(newToSet, req.params.remoteOrderId);
        return res.status(200).json(
            {
                "status": "ORDER_CANCELLED",
                "message": "customer cancelled order"
            }
        ).end();
        //res.status(200).send(result).end();
    } catch (error) {
        return res.status(400).json(error).end();
    }
};

const initPlatform = (internalCode, uuid) => {
    const platformFactory = new PlatformFactory();
    return platformFactory.createPlatform(
        PlatformSingleton.getByCod(internalCode),
        uuid
    );
};


module.exports = {
    saveOrder,
    updateOrder
};
