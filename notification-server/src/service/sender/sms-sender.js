var smpp = require('smpp');
var env = require('dotenv').config();
var sendSmsQueueName = env.TURBO_SMS_RABBIT_MQ_QUEUE;
var transceiverCredentials = {
    system_id: env.TURBO_SMS_SMPP_SYSTEM_ID,
    password: env.TURBO_SMS_SMPP_PASSWORD
};
exports.checkQueueAndSendMessage = function (connection, logger) {
    var pduHandler = function (pdu) {
        logger.info('pduHandler command_status', pdu.command_status);
        if (pdu.command_status == 0) {
            logger.info('Successfully connected to turbosms');
        }
    };
    connection.then(function (conn) {
        logger.info('Successfully connected to rabbit');
        var channel = conn.createChannel();
        channel = channel.then(function (ch) {
            logger.info('Channel created');

            ch.assertExchange(sendSmsQueueName);
            logger.info('Assert exchange');

            ch.assertQueue(sendSmsQueueName);
            logger.info('Assert queue');

            ch.consume(sendSmsQueueName, function (msg) {
                logger.info('Channel consume');

                if (msg !== null) {
                    var smppSession = smpp.connect(env.TURBO_SMS_SMPP_HOST, env.TURBO_SMS_SMPP_PORT);

                    smppSession.bind_transceiver(transceiverCredentials, pduHandler);

                    var mpqMessage = JSON.parse(msg.content.toString());

                    logger.info('mpqMessage', mpqMessage);
                    logger.info('transceiverCredentials: ', transceiverCredentials);

                    var smsParams = {
                        source_addr: env.TURBO_SMS_SMPP_SOURCE,
                        destination_addr: mpqMessage.phone,
                        short_message: mpqMessage.message
                    };

                    logger.info('smsParams: ', smsParams);

                    var sendSmsHandler = function (pdu) {
                        logger.info('sendSmsHandler command_status', pdu.command_status);

                        if (pdu.command_status != 0) {
                            logger.error('Message not delivered. PDU command status: ' + pdu.command_status, msg);
                        }
                        ch.ack(msg);
                        smppSession.close();
                    };
                    smppSession.submit_sm(smsParams, sendSmsHandler);
                }
            });
        });

        return channel;
    }).then(null, logger.warn);
};