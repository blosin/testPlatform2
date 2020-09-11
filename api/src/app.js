import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import routes from './routes';
import http from 'http';
import morgan from 'morgan';
import jwt from 'express-jwt';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import checkRoutePermissions from './middlewares/route-permissions';
import CustomError from './utils/errors/customError';
import { CORE } from './utils/errors/codeError';
import UUID from './utils/errors/utils';
const settings = require('./config/settings');
const logger = require('./config/logger');

const urlPrefix = `/${process.env.NODE_ENV}`;

const exceptions = [
  { url: `${urlPrefix}/thirdParties/login`, methods: ['POST'] },
  { url: `${urlPrefix}/uberEats/tracking`, methods: ['POST'] },
  { url: `${urlPrefix}` + /\/glovo\/orders(\/?.*)/, methods: ['GET', 'POST'] },
  { url: `/` },
];

const cors = require('cors');
const https = require('https');
const app = express();
app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const server = http.Server(app);

https.createServer(app)
  .listen(settings.portHttps);

app.use((req, res, next) => {
  const uuid = UUID();
  req.uuid = uuid;
  next();
});

const morganParser = (tokens, req, res) => {
  const log = {
    method: tokens.method(req, res),
    path: tokens.url(req, res),
    res_status: tokens.status(req, res),
    res_time: tokens['response-time'](req, res),
    ip: req ? req.ip : 'X.X.X.X',
    branchId: req.token ? req.token.branchId : 'null',
    params: req.params
  };

  if (
    (log.path == '/api/branches/news' && log.method == 'GET') &&
    (process.env.NODE_ENV == 'staging' || process.env.NODE_ENV == 'production')
    || !log.path.includes('/api/')
  )
    return undefined;
  return JSON.stringify(log);
};

app.use(morgan(morganParser, { stream: logger.stream }));
app.disable('etag');
app.use(cors());

app.use(jwt({ secret: settings.token.secret })
  .unless({ path: exceptions }));

app.use(function (err, req, res, next) {
  let msg = err.message;
  if (err.message === 'jwt expired') msg = 'Expired token.';
  if (err.message === 'invalid signature') msg = 'Invalid token.';
  const custerr = new CustomError(CORE.TOKEN, msg, req.uuid);
  return res
    .status(401)
    .json(custerr)
    .end();
});

app.use((req, res, next) =>
  checkRoutePermissions(req, res, next));

app.use(bodyParser.json());

app.use(cookieParser());

app.use(urlPrefix, routes);

export { app, server };