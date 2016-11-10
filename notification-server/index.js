var ampqlib = require('amqplib');
var env = require('dotenv').config();

var WebPushSender = require('./src/service/sender/web-push-sender.js');
var logger = require('./src/service/logger/logger.js');

var connection = ampqlib.connect(env.AMPQ_HOST);

WebPushSender.checkQueueAndSendMessage(
    connection,
    logger.getLoggerForSender('webPushSender')
);
