var env = require('dotenv').config();
var http = require('http');
var server = http.createServer().listen(7000);
var io = require('socket.io').listen(server);

var sendWebPushQueueName = env.WEB_PUSH_RABBIT_MQ_QUEUE;

/** @note Notice that you can at most send notifications to 1000 registration tokens at a time.
 *
 * @param connection
 * @param logger
 */
exports.checkQueueAndSendMessage = function (connection, logger) {

    connection.then(function (conn) {
        logger.info('Successfully connected to rabbit');

        var channel = conn.createChannel();
        channel = channel.then(function (ch) {
            logger.info('Channel created');

            ch.assertExchange(sendWebPushQueueName);
            logger.info('Assert exchange');

            ch.assertQueue(sendWebPushQueueName);
            logger.info('Assert queue');

            ch.consume(sendWebPushQueueName, function (msg) {
                logger.info('Channel consume');

                if (msg !== null) {
                    var mpqMessage = JSON.parse(msg.content.toString());
                    var channel = null;

                    logger.info('Channel consume', mpqMessage);

                    if (mpqMessage.attributes.global === false) {

                        if (mpqMessage.type === 'user_notification') {
                            mpqMessage.attributes.recipients.forEach(function (recipientHash) {
                                channel = '/user/' + recipientHash + '/notification';
                                io.sockets.emit(channel, mpqMessage);
                                logger.info('channel', channel);
                            });

                            ch.ack(msg);
                        }

                        if (mpqMessage.type === 'entity_delete') {
                            mpqMessage.attributes.recipients.forEach(function (recipientHash) {
                                channel = '/user/' + recipientHash + '/entity_delete';
                                io.sockets.emit(channel, mpqMessage);
                                logger.info('channel', channel);
                            });

                            ch.ack(msg);
                        }
                    }

                    if (mpqMessage.attributes.global === true) {
                        if (mpqMessage.type === 'entity_update') {
                            channel = '/global/entity_update';
                            io.sockets.emit(channel, mpqMessage);
                            logger.info('channel', channel);

                            ch.ack(msg);
                        }

                        if (mpqMessage.type === 'entity_delete') {
                            channel = '/global/entity_delete';
                            io.sockets.emit(channel, mpqMessage);
                            logger.info('channel', channel);

                            ch.ack(msg);
                        }
                    }
                }
            });
        });

        return channel;
    }).then(null, logger.warn);
};
