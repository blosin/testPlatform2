import mongoose from 'mongoose';
mongoose.plugin(require('@meanie/mongoose-to-json'));

import settings from './config/settings';
import { app } from './app';
import logger from './config/logger';
import utils from './utils';
import CustomError from './utils/errors/customError';
import { CORE, DB } from './utils/errors/codeError';

async function start() {
  await connectWithRetry();
  console.log(`\nDatabase connected.\t HOST: ${settings.database.host}.`);

  /* Do all stuff after connection */
  await utils.initUtils();

  app.listen(settings.port, () => {
    console.log(`Server running.\t\t PORT: ${settings.port} - ENV: ${process.env.NODE_ENV.toUpperCase()}.\n`);
  });
}

const connectWithRetry = async function () {
  const connString =
    `mongodb+srv://${settings.database.username}:${settings.database.password}@${settings.database.host}/${settings.database.name}?retryWrites=true&w=majority`;
  try {
   await mongoose
      .connect(connString, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true,
        useUnifiedTopology: true,
        connectTimeoutMS: 10000,
      });
  } catch (err) {
    const msg = `Can not connect to database`;
    new CustomError(DB.CONN, msg, { error: err.toString() });
  }
};

mongoose.connection.on('disconnected', () => {
  const msg = `Disconnected. Reconnecting.`;
  logger.error({ message: msg, meta: {} });
  setTimeout(connectWithRetry, 1000);
});

process.on('unhandledRejection', (reason, promise) => {
  const msg = `Unhandled Rejection`;
  new CustomError(CORE.UNHANDLED, msg, { reasonStack: reason.stack, reason, promise });
});

process.on('uncaughtException:', (reason, promise) => {
  const msg = `Uncaught Rejection`;
  new CustomError(CORE.UNCAUGHT, msg, { reasonStack: reason.stack, reason, promise });
});

connectWithRetry();
start();
