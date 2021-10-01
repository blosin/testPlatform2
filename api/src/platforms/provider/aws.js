import AWS from 'aws-sdk';
import config from '../../config/env';
import SetNews from '../management/strategies/set-news';
import { Consumer } from 'sqs-consumer';
import _ from 'lodash';
import CustomError from '../../utils/errors/customError';
import { APP_BRANCH } from '../../utils/errors/codeError';

class Aws {
  constructor() {
    AWS.config.setPromisesDependency();
    AWS.config.update({
      region: config.AWS.REGION
    });
  }

  retriveKey({ key = requiredParam('key') }) {
    const ssm = new AWS.SSM({
      credentials: null
    });
    return ssm
      .getParameters({
        Names: [key]
      })
      .promise()
      .then((res) => res.Parameters.pop())
      .then((param) => param.Value);
  }

  async pushNewToQueue(newOrder) {
    const sqs = new AWS.SQS({
      region: config.AWS.SQS.REGION,
      credentials: null
    });

    const params = {
      MessageBody: JSON.stringify(newOrder),
      MessageGroupId: newOrder._id.toString(),
      QueueUrl: config.AWS.SQS.ORDER_PRODUCER.NAME.replace(
        '##_',
        newOrder.branchId.toString()
      )
    };
    return sqs.sendMessage(params).promise();
  }

  pollFromQueue() {
    const sqs = new AWS.SQS({
      region: config.AWS.SQS.REGION,
      credentials: null
    });
    const sqsParams = {
      AttributeNames: ['All'],
      QueueUrl: config.AWS.SQS.ORDER_CONSUMER.NAME
    };

    let thirdConsumer, secondConsumer, fourConsumer, sizeMessageSQS;

    Consumer.create({
      queueUrl: config.AWS.SQS.ORDER_CONSUMER.NAME,
      region: config.AWS.SQS.REGION,
      attributeNames: ['All'],
      batchSize: 10,
      handleMessageBatch: async (messages) => {
        sqs.getQueueAttributes(sqsParams, function (err, data) {
          if (err) {
            console.log(err, err.stack);
          } else {
            sizeMessageSQS = parseInt(
              data.Attributes.ApproximateNumberOfMessages
            );
          }
        });
        const newsForFilter = messages;
        const newsNoIds = newsForFilter.filter((n) => !JSON.parse(n.Body).id);
        const totalIds = newsForFilter
          .filter((n) => !!JSON.parse(n.Body).id)
          .map((n) => JSON.parse(n.Body).id);
        const uniqueIds = _.uniqWith(totalIds, _.isEqual);

        // Must be process sequentially
        const promises = uniqueIds.map((id) => {
          let newsToSet = newsForFilter.filter(
            (n) => JSON.parse(n.Body).id == id
          );
          return new Promise(async (res) => {
            for (let newToSet of newsToSet) {
              try {
                const setNews = new SetNews(
                  newToSet.Attributes.MessageGroupId,
                  newToSet.MessageId
                );
                await setNews.setNews(JSON.parse(newToSet.Body));
              } catch (error) {
                const msg = 'No se pudo procesar la novedad.';
                const meta = { error: error.toString(), newToSet };
                const err = new CustomError(APP_BRANCH.LOGIN, msg, meta);
              }
            }
            res();
          });
        });
        const result = await Promise.all(promises);
        //  Can be process in parallel
        for (let newToSet of newsNoIds) {
          try {
            const setNews = new SetNews(
              newToSet.Attributes.MessageGroupId,
              newToSet.MessageId
            );
            setNews.setNews(JSON.parse(newToSet.Body));
          } catch (error) {
            const msg = 'No se pudo procesar la novedad.';
            const meta = { error: error.toString(), newToSet };
            const err = new CustomError(APP_BRANCH.LOGIN, msg, meta);
          }
        }
      }
    })
      .on('error', (err) => {
        console.error('ERR', err.message);
      })
      .on('processing_error', (err) => {
        console.error('PROC_ERR', err.message);
      })
      .on('response_processed', () => {
        if (!secondConsumer && sizeMessageSQS > 200) {
          secondConsumer = this.createConsumerSQS();
          secondConsumer.start();
        } else if (secondConsumer && sizeMessageSQS < 100) {
          secondConsumer.stop();
          secondConsumer = null;
        }
        if (!thirdConsumer && sizeMessageSQS > 400) {
          thirdConsumer = this.createConsumerSQS();
          thirdConsumer.start();
        } else if (thirdConsumer && sizeMessageSQS < 200) {
          thirdConsumer.stop();
          thirdConsumer = null;
        }
        if (!fourConsumer && sizeMessageSQS > 600) {
          fourConsumer = this.createConsumerSQS();
          fourConsumer.start();
        } else if (fourConsumer && sizeMessageSQS < 300) {
          fourConsumer.stop();
          fourConsumer = null;
        }
      })
      .start();
  }

  createConsumerSQS() {
    return Consumer.create({
      queueUrl: config.AWS.SQS.ORDER_CONSUMER.NAME,
      region: config.AWS.SQS.REGION,
      attributeNames: ['All'],
      batchSize: 10,
      handleMessageBatch: async (messages) => {
        const newsForFilter = messages;
        const newsNoIds = newsForFilter.filter((n) => !JSON.parse(n.Body).id);
        const totalIds = newsForFilter
          .filter((n) => !!JSON.parse(n.Body).id)
          .map((n) => JSON.parse(n.Body).id);
        const uniqueIds = _.uniqWith(totalIds, _.isEqual);

        // Must be process sequentially
        const promises = uniqueIds.map((id) => {
          let newsToSet = newsForFilter.filter(
            (n) => JSON.parse(n.Body).id == id
          );
          return new Promise(async (res) => {
            for (let newToSet of newsToSet) {
              try {
                const setNews = new SetNews(
                  newToSet.Attributes.MessageGroupId,
                  newToSet.MessageId
                );
                await setNews.setNews(JSON.parse(newToSet.Body));
              } catch (error) {
                const msg = 'No se pudo procesar la novedad.';
                const meta = { error: error.toString(), newToSet };
                const err = new CustomError(APP_BRANCH.LOGIN, msg, meta);
              }
            }
            res();
          });
        });
        const result = await Promise.all(promises);
        //  Can be process in parallel
        for (let newToSet of newsNoIds) {
          try {
            const setNews = new SetNews(
              newToSet.Attributes.MessageGroupId,
              newToSet.MessageId
            );
            setNews.setNews(JSON.parse(newToSet.Body));
          } catch (error) {
            const msg = 'No se pudo procesar la novedad.';
            const meta = { error: error.toString(), newToSet };
            const err = new CustomError(APP_BRANCH.LOGIN, msg, meta);
          }
        }
      }
    })
      .on('error', (err) => {
        console.error('ERR', err.message);
      })
      .on('processing_error', (err) => {
        console.error('PROC_ERR', err.message);
      });
  }

  async pushAutoReplyToQueue(id, branchId) {
    const sqs = new AWS.SQS({
      region: config.AWS.SQS.REGION,
      credentials: null
    });
    let data = [
      {
        MessageBody: { id, typeId: 10, typeIdPrev: 1 },
        MessageGroupId: id + branchId
      },
      {
        MessageBody: { id, typeId: 11 },
        MessageGroupId: id + branchId
      },
      {
        MessageBody: { id, typeId: 5 },
        MessageGroupId: id + branchId
      },
      {
        MessageBody: { id, typeId: 3 },
        MessageGroupId: id + branchId
      },
      {
        MessageBody: { id, typeId: 14 },
        MessageGroupId: id + branchId
      }
    ];

    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      const params = {
        MessageBody: JSON.stringify(element.MessageBody),
        MessageGroupId: element.MessageGroupId,
        QueueUrl: config.AWS.SQS.ORDER_CONSUMER.NAME
      };
      await sqs.sendMessage(params).promise();
    }
  }
}

export default Aws;
