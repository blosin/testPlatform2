import PlatformFactory from '../platforms/management/factory_platform';
import SetNews from '../platforms/management/strategies/set-news';
import PlatformSingleton from '../utils/platforms';
import { isArray } from 'lodash';
import NewsTypeSingleton from '../utils/newsType';
import branches from '../config/branches.json'


const saveOrder = (req, res) => {
    /* TODO: VALIDATE DATA TYPE OF INPUT */
    req.body.branchId = branches.find(r => r.name === req.params.remoteId).branchId;
   
    req.body.state = "PENDING";

    const platform = initPlatform(1, req.uuid);

    //verifica si la plataforma esta activa en backoffice
    if (platform._platform.active != undefined && !platform._platform.active) {     
        res.status(400).json( {
            reason: 'Error',
            message: 'Platform not active'}).end();
    }

    if (isArray(req.body)) {
        req.body.forEach(async (data) => {
            data.peya = true;
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
                if (resultPromise.state === 'CLOSED_RESTAURANT_REJECTED') {      
                    
                    const headersConfig = {
                        headers: { 
                          'Authorization': `Bearer ${this.tokenPeya}`,
                          'Content-Type': 'application/json'
                        }
                    };                    
               
                    let urlAvailability= `${settings.peya}/v2/chains/${settings.chainCode}/remoteVendors/${req.params.remoteId}/availability`;
                    axios.get(urlAvailability,null,headersConfig).then(r => {                                        
                        let body = {
                            "availabilityState": "CLOSED",
                            "closedReason": "OTHER",
                            "platformKey": r.data[0].platformKey,
                            "platformRestaurantId": r.data[0].platformRestaurantId
                        };      
                        const url = `${settings.peya}/v2/chains/${settings.chainCode}/remoteVendors/${req.params.remoteId}/availability`;
                        axios.put(url, body, headersConfig).then();                       
                    });         
                    res.status(400).json({
                        reason: 'Error',
                        message: 'CLOSED RESTAURANT REJECTED'}).end();            
                }
                res.status(200).json(
                    {
                        "remoteResponse": {
                            "remoteOrderId": req.body.code
                        }
                    }
                ).end();              
            })
            .catch((error) => {
                res.status(400).json(error).end();
            });
    } else
        req.body.peya = true;
        platform
            .validateNewOrders(req.body)
            .then((ordersSaved) => {
                if (ordersSaved.state === 'CLOSED_RESTAURANT_REJECTED'){    
                    const headersConfig = {
                        headers: { 
                          'Authorization': `Bearer ${this.tokenPeya}`,
                          'Content-Type': 'application/json'
                        }
                    };  
                    let urlAvailability= `${settings.peya}/v2/chains/${settings.chainCode}/remoteVendors/${req.params.remoteId}/availability`;
                    axios.get(urlAvailability,null,headersConfig).then(statusPos => {                                        
                        let body = {
                            "availabilityState": "CLOSED",
                            "closedReason": "OTHER",
                            "platformKey": statusPos.data[0].platformKey,
                            "platformRestaurantId": statusPos.data[0].platformRestaurantId
                        };      
                        const url = `${settings.peya}/v2/chains/${settings.chainCode}/remoteVendors/${req.params.remoteId}/availability`;
                        axios.put(url, body, headersConfig).then();                       
                    });                                
                    res.status(400).json({
                        reason: 'Error',
                        message: 'CLOSED RESTAURANT REJECTED'}).end();
                }
                res.status(200).json(
                    {
                        "remoteResponse": {
                            "remoteOrderId": req.body.code
                        }
                    }
                ).end();                
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
