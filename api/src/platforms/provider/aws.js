import AWS from 'aws-sdk';
import config from '../../config/env';
import SetNews from '../management/strategies/set-news';

class Aws {
    constructor() {
        AWS.config.setPromisesDependency();
        AWS.config.update({
            region: 'us-east-1'
        });
    }

    retriveKey({
        key = requiredParam('key'),
    }) {
        const ssm = new AWS.SSM();
        return ssm
            .getParameters({
                Names: [key]
            })
            .promise()
            .then((res) => res.Parameters.pop())
            .then((param) => param.Value);
    }

    pushNewToQueue(newOrder) {
        const sqs = new AWS.SQS();
        const params = {
            QueueUrl: config.AWS.SQS.ORDER_PRODUCER.NAME,
            MessageGroupId: newOrder.branchId.toString(),
            MessageBody: JSON.stringify(newOrder)
        };
        sqs.sendMessage(params)
            .promise()
            .then((res) => res.MessageId);
    }

    pollFromQueue() {
        const sqs = new AWS.SQS({ apiVersion: '2008-10-17', region: 'us-east-1' });
        const params = {
            QueueUrl: config.AWS.SQS.ORDER_CONSUMER.NAME,
            AttributeNames: [
                'MessageGroupId', 'Messages', 'ResponseMetadata'
            ],
            WaitTimeSeconds: 20
        };
        console.log(params);
        console.log(sqs);
        sqs.receiveMessage(params)
            .promise()
            .then(async (response) => {
                if (!!response.Messages)
                    for (let message of response.Messages) {
                        const setNews = new SetNews(message.Attributes.MessageGroupId, response.ResponseMetadata.RequestId);
                        await setNews.setNews(JSON.parse(message.Body));
                    };
                return response;
            })
            .then((response) => {
                console.log(new Date(), response);
                return response;
            })
            .then(async (response) => {
                if (!!response.Messages)
                    await this.removeFromQueue(response.Messages);
            })
            .then(() => this.pollFromQueue())
            .catch((e) => console.log('error', e))
    }

    removeFromQueue(messages) {
        const sqs = new AWS.SQS();
        const params = {
            QueueUrl: config.AWS.SQS.ORDER_CONSUMER.NAME,
            Entries: messages.map((message) => {
                return {
                    Id: message.MessageId,
                    ReceiptHandle: message.ReceiptHandle
                }
            })
        };
        sqs.deleteMessageBatch(params)
            .promise();
    }
}

export default Aws;