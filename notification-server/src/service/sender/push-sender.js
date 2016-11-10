var gcm = require('node-gcm');
var env = require('dotenv').config();
var sendPushQueueName = env.GCM_RABBIT_MQ_QUEUE;
var androidSender = new gcm.Sender(env.ANDROID_GCM_SERVER_API_KEY);
var iosSender = new gcm.Sender(env.IOS_GCM_SERVER_API_KEY);
/** @note Notice that you can at most send notifications to 1000 registration tokens at a time.
 *
 * @param connection
 * @param logger
 */
exports.checkQueueAndSendMessage = function (connection, logger) {
    /**
     * Return server api key for gcm service for different os
     *
     * @param {string} osTypeName
     *
     * @returns {string}
     */
    function getGcmSender(osTypeName) {
        if (osTypeName == env.OS_TYPE_ANDROID) {
            return androidSender;
        }
        if (osTypeName == env.OS_TYPE_IOS) {
            return iosSender;
        }
        logger.error('there is not any os type that match os type name called: ' + osTypeName);
        return  null;
    }
    /**
     * @param {{title: number, body: string, icon: string, os_type: string, registrationTokens: []}} mpqMessage
     * @callback callback
     *
     * @param callback
     */
    function sendPushNotification(mpqMessage, callback) {
        var message = new gcm.Message();
        var registrationTokens = mpqMessage.registrationTokens;

        var pushNotificationHandler = function(error, response) {
            if (error) {
                logger.error(error)
            }
            logger.info(response);
            callback();
        };

        message.addNotification({
            title: mpqMessage.title,
            body: mpqMessage.body,
            icon: mpqMessage.icon ? mpqMessage.icon : 'ic_launcher'
        });

        var sender = getGcmSender(mpqMessage.os_type);
        if (sender) {
            sender.send(message, { registrationTokens: registrationTokens }, pushNotificationHandler);
        }
    }
    connection.then(function (conn) {
        logger.info('Push-sender successfully connected to rabbit');
        var channel = conn.createChannel();

        channel = channel.then(function channelResolveFunction(ch) {
            logger.info('Push-sender successfully created channel');

            ch.assertExchange(sendPushQueueName);
            logger.info('Push-sender successfully asserted exchange');

            ch.assertQueue(sendPushQueueName);
            logger.info('Push-sender successfully asserted queue');

            ch.consume(sendPushQueueName, function consumePushQueue(msg) {
                logger.info('Push-sender successfully consume messages');

                if (msg !== null) {
                    var mpqMessage = JSON.parse(msg.content.toString());
                    logger.info('mpqMessage', mpqMessage);

                    sendPushNotification(mpqMessage, function postPushNotification() {
                        ch.ack(msg);
                    });
                }
            });
        });

        return channel;
    }).then(null, logger.warn);
};