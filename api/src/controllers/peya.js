import PlatformFactory from '../platforms/management/factory_platform';
import SetNews from '../platforms/management/strategies/set-news';
import PlatformSingleton from '../utils/platforms';
import { isArray } from 'lodash';
import NewsTypeSingleton from '../utils/newsType';
import axios from 'axios';
import settings from '../config/settings';
import branch from '../models/branch';
import platforms from '../models/platform';
const mongoose = require('mongoose');

const saveOrder = async (req, res) => {
    /* TODO: VALIDATE DATA TYPE OF INPUT */
    //req.body.branchId = branches.find(r => r.name === req.params.remoteId).branchId;
    
    const platform = initPlatform(1, req.uuid);
    let peya = await platforms.findOne({ name: 'PedidosYa'});
    let currentBranch = await branch.findOne({'platforms.platform':mongoose.Types.ObjectId(peya.id), 'platforms.branchName':req.params.remoteId, 'platforms.StateAPI': true});
    if (!(currentBranch)) {     

        const headersConfig3 = {
            headers: { 
              'Authorization': `Bearer ${platform.tokenPeya}`,
              'Content-Type': 'application/json'
            }
        };                    
        let urlAvailability= `${platform._platform.credentials.data.baseUrl}/v2/chains/${settings.chainCode}/remoteVendors/${req.params.remoteId}/availability`;
        let statuspos = await axios.get(urlAvailability,headersConfig3);
        let body = {
            "availabilityState": "CLOSED",
            "closedReason": "OTHER",
            "platformKey": statuspos.data[0].platformKey,
            "platformRestaurantId": statuspos.data[0].platformRestaurantId
        };                  
        let temp = await axios.put(urlAvailability, body, headersConfig3);                   
        res.status(400).json({
            reason: 'CLOSED',
            message: 'CLOSED RESTAURANT REJECTED'}).end();  
       return;
    }
    
    req.body.branchId = currentBranch.branchId;

    req.body.state = "PENDING";

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
            .then(async (resultPromise) => {
                if (resultPromise.state === 'CLOSED_RESTAURANT_REJECTED') {      
                    const headersConfig2 = {
                        headers: { 
                          'Authorization': `Bearer ${platform.tokenPeya}`,
                          'Content-Type': 'application/json'
                        }
                    };   
                                     
                    let urlAvailability= `${platform._platform.credentials.data.baseUrl}/v2/chains/${settings.chainCode}/remoteVendors/${remoteId}/availability`;
                   
                   let statuspos = await axios.get(urlAvailability,headersConfig2);
                    let body = {
                        "availabilityState": "CLOSED",
                        "closedReason": "OTHER",
                        "platformKey": statuspos.data[0].platformKey,
                        "platformRestaurantId": statuspos.data[0].platformRestaurantId
                    };     
                              
                    let temp = await axios.put(urlAvailability, body, headersConfig2);                
                    res.status(400).json({
                        reason: 'CLOSED',
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
            .catch(async (error) => {      
                res.status(400).json({
                    reason: 'ERROR',
                    message: 'ERROR RESTAURANT REJECTED'}).end();  
            });
    } else
        req.body.peya = true;
        platform
            .validateNewOrders(req.body)
            .then(async (ordersSaved) => {
                if (ordersSaved.state === 'CLOSED_RESTAURANT_REJECTED'){                     
                    const headersConfig2 = {
                        headers: { 
                          'Authorization': `Bearer ${platform.tokenPeya}`,
                          'Content-Type': 'application/json'
                        }
                    };                    
                    let urlAvailability= `${platform._platform.credentials.data.baseUrl}/v2/chains/${settings.chainCode}/remoteVendors/${req.params.remoteId}/availability`;
                   
                   let statuspos = await axios.get(urlAvailability,headersConfig2);
                    let body = {
                        "availabilityState": "CLOSED",
                        "closedReason": "OTHER",
                        "platformKey": statuspos.data[0].platformKey,
                        "platformRestaurantId": statuspos.data[0].platformRestaurantId
                    };
                              
                    let temp = await axios.put(urlAvailability, body, headersConfig2);                   
                    res.status(400).json({
                        reason: 'CLOSED',
                        message: 'CLOSED RESTAURANT REJECTED'}).end();                   
                }
                else
                res.status(200).json(
                    {
                        "remoteResponse": {
                            "remoteOrderId": req.body.code
                        }
                    }
                ).end();                
            })
            .catch(async (error) => {                            
                res.status(400).json({
                    reason: 'ERROR',
                    message: 'ERROR RESTAURANT REJECTED'}).end();  
            })
            
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
