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
import router from './routes/peya';

const settings = require('./config/settings');

let urlPrefix = '/api';
if (process.env.NODE_ENV === 'testing') urlPrefix = `/${process.env.NODE_ENV}`;

const exceptions = [
  { url: `${urlPrefix}/thirdParties/login`, methods: ['POST'] },
  { url: `${urlPrefix}/uberEats/tracking`, methods: ['POST'] },
  { url: `${urlPrefix}/glovo/orders`, methods: ['POST'] },
  { url: /\/api\/glovo\/orders\/?.*/, methods: ['GET', 'POST'] },
  { url: /\/testing\/glovo\/orders\/?.*/, methods: ['GET', 'POST'] },
  { url: `/` },
  { url: /\/order\/?.*/, methods: ['POST'] },
  { url: /\/remoteId\/?.*/, methods: ['PUT'] },
];

const cors = require('cors');
const https = require('https');
const app = express();
app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const server = http.Server(app);

https.createServer(app).listen(settings.portHttps);

app.use((req, res, next) => {
  const uuid = UUID();
  req.uuid = uuid;
  next();
});

app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms', {
    skip: (req, res) =>
      (req.originalUrl === '/api/branches/news' && req.method === 'GET') ||
      req.originalUrl === '/'
  })
);

app.disable('etag');
app.use(cors());

app.use(jwt({ secret: settings.token.secret }).unless({ path: exceptions }));

app.use(function (err, req, res, next) {
  let msg = err.message;
  if (err.message === 'jwt expired') msg = 'Expired token.';
  if (err.message === 'invalid signature') msg = 'Invalid token.';
  const custerr = new CustomError(CORE.TOKEN, msg, req.uuid);
  return res.status(401).json(custerr).end();
});

app.use((req, res, next) => checkRoutePermissions(req, res, next));

app.use(bodyParser.json());

app.use(cookieParser());

app.use(urlPrefix, routes);

app.use('/',router);

export { app, server };
