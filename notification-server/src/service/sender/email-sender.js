var env = require('dotenv').config();
var MandrillAPI = require('mailchimp').MandrillAPI;
var apiKey = env.MANDRILL_API_KEY;

var sendEmailQueueName = env.MANDRILL_RABBIT_MQ_QUEUE;

function sendEmail(msg, logger, callback) {
    try {
        var mandrill = new MandrillAPI(apiKey, {version: '1.0', secure: false});
    } catch (error) {
        logger.error(error.message);
    }

    var message = {
        html: msg.html,
        text: msg.plainText,
        subject: msg.subject,
        from_email: msg.from.email,
        from_name: msg.from.name,
        to: [{
            "email": msg.to.email,
            "name": msg.to.name,
            "type": msg.to.type
        }],
        headers: {
            "Reply-To": msg.headers.replyTo
        }
    };

    mandrill.call('messages', 'send', {message: message}, function (error, data) {
        if (error) {
            logger.error(error.message);
        } else {
            logger.info('Email successfully sent. Response data: ' + JSON.stringify(data));
            callback();
        }
    });
}

exports.checkQueueAndSendMessage = function (connection, logger) {

    connection.then(function (conn) {
        logger.info('Successfully connected to rabbit');

        var channel = conn.createChannel();
        channel = channel.then(function (ch) {
            logger.info('Channel created');

            ch.assertExchange(sendEmailQueueName);
            logger.info('Assert exchange');

            ch.assertQueue(sendEmailQueueName);
            logger.info('Assert queue');

            ch.consume(sendEmailQueueName, function (msg) {
                logger.info('Channel consume');
                if (msg !== null) {
                    var mpqMessage = JSON.parse(msg.content.toString());
                    logger.info('mpqMessage', mpqMessage);
                    sendEmail(mpqMessage, logger, function () {
                        ch.ack(msg);
                    });
                }
            });
        });

        return channel;
    }).then(null, logger.warn);
};
