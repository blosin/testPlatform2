import jwt from 'jsonwebtoken';
import settings from '../config/settings';
import CustomError from '../utils/errors/customError';
import { CORE } from '../utils/errors/codeError';

const required = (req, res, next) => {
  try {
    let peyaOrder = req.url.startsWith('/order/'); 
    if (
      !peyaOrder &&
      req.headers &&
      req.headers.authorization &&
      req.headers.authorization.split(' ')[0] === 'Bearer'
    ) {
      jwt.verify(
        req.headers.authorization.split(' ')[1],
        settings.token.secret,
        (err, token) => {       
          if (err) throw 'El token está corrupto.';
          
          req.token = token.user;
          if (!req.token.permissions) req.token.permissions = [];
          if (!req.token.permissions.some((p) => req.path.includes(p)))
            throw 'El token no tiene permisos de acceso a la ruta.';
        }
      );
    }
    if(peyaOrder){
      jwt.verify(
        req.headers.authorization,
        settings.peyaParams.secret,
        (err, token) => {       
          if (err) throw 'Error el token está corrupto.';
          if (!token.payload.service.includes('middleware')){
            throw 'El token está corrupto.';
          }         
        }
      );
    }
    next();
  } catch (msg) {
    const err = new CustomError(CORE.TOKEN, msg, '11111', { token: req.token });
    return res.status(401).json(err).end();
  }
};

module.exports = required;
