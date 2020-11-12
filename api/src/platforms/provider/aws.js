import AWS from 'aws-sdk';
import config from '../../config/env';
import SetNews from '../management/strategies/set-news';
import { Consumer } from 'sqs-consumer';
import { Producer } from 'sqs-producer';

class Aws {
  constructor() {
    AWS.config.setPromisesDependency();
    AWS.config.update({
      region: config.AWS.REGION,
    });
  }

  retriveKey({ key = requiredParam('key') }) {
    const ssm = new AWS.SSM();
    return ssm
      .getParameters({
        Names: [key],
      })
      .promise()
      .then((res) => res.Parameters.pop())
      .then((param) => param.Value);
  }

  async pushNewToQueue(newOrder) {
    const producer = Producer.create({
      queueUrl: config.AWS.SQS.ORDER_PRODUCER.NAME.replace(
        '##_',
        newOrder.branchId.toString(),
      ),
      region: config.AWS.SQS.REGION,
    });
    return producer.send({
      id: newOrder._id.toString(),
      body: JSON.stringify(newOrder),
      groupId: newOrder.branchId.toString(),
    });
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
          console.log('entro');
          console.log(message);
          const setNews = new SetNews(
            message.Attributes.MessageGroupId,
            message.MessageId,
          );
          const x = await setNews.setNews(JSON.parse(message.Body));
          console.log('33333', x);
        });
      },
      /* sqs: new AWS.SQS({
                httpOptions: {
                    agent: new https.Agent({
                        keepAlive: true
                    })
                } 
            })*/
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
