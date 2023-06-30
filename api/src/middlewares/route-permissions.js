import jwt from 'jsonwebtoken';
import settings from '../config/settings';
import CustomError from '../utils/errors/customError';
import { CORE } from '../utils/errors/codeError';

const required = (req, res, next) => {
  try {
    if (
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
    next();
  } catch (msg) {
    const err = new CustomError(CORE.TOKEN, msg, '11111', { token: req.token });
    return res.status(401).json(err).end();
  }
};

module.exports = required;
