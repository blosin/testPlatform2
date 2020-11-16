import AWS from 'aws-sdk';
import config from '../../config/env';
import SetNews from '../management/strategies/set-news';
import { Consumer } from 'sqs-consumer';

class Aws {
  constructor() {
    AWS.config.setPromisesDependency();
    AWS.config.update({
      region: config.AWS.REGION,
    });
  }

  retriveKey({ key = requiredParam('key') }) {
    const ssm = new AWS.SSM({
      credentials: null
    });
    return ssm
      .getParameters({
        Names: [key],
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
      QueueUrl: config.AWS.SQS.ORDER_PRODUCER.NAME.replace('##_', newOrder.branchId.toString()),
    };
    return sqs
      .sendMessage(params)
      .promise();
  }

  pollFromQueue() {
    Consumer.create({
      queueUrl: config.AWS.SQS.ORDER_CONSUMER.NAME,
      region: config.AWS.SQS.REGION,
      attributeNames: [
        'MessageGroupId',
        'Messages',
        'ResponseMetadata',
        'RequestId',
      ],
      batchSize: 10,
      handleMessageBatch: (messages) => {
        messages.forEach(async (message) => {
          const setNews = new SetNews(
            message.Attributes.MessageGroupId,
            message.MessageId,
          );
          setNews.setNews(JSON.parse(message.Body));
        });
      },
    })
      .on('error', (err) => {
        console.error('ERR', err.message);
      })
      .on('processing_error', (err) => {
        console.error('PROC_ERR', err.message);
      })
      .start();
  }
}

export default Aws;
