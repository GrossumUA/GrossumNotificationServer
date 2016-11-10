var winston = require('winston');

winston.loggers.add('smsLogger', {
    console: {
        colorize: true,
        label: 'sms logger'
    },
    file: {
        filename: './logs/sms-sender.log'
    }
});

winston.loggers.add('emailLogger', {
    console: {
        colorize: true,
        label: 'email logger'
    },
    file: {
        filename: './logs/email-sender.log'
    }
});

winston.loggers.add('webPushLogger', {
    console: {
        colorize: true,
        label: 'web push logger'
    },
    file: {
        filename: './logs/web-push-sender.log'
    }
});

var loggers = {
    smsSender: winston.loggers.get('smsLogger'),
    emailSender: winston.loggers.get('emailLogger'),
    webPushSender: winston.loggers.get('webPushLogger')
};

if (process.env.NODE_ENV !== 'dev') {
    loggers.smsSender.remove(winston.transports.Console);
    loggers.emailSender.remove(winston.transports.Console);
    loggers.webPushSender.remove(winston.transports.Console);
}

exports.getLoggerForSender = function (senderName) {
    if (!loggers.hasOwnProperty(senderName)) {
        console.log('Logger for' + senderName + ' does not exist!');
        return;
    }
    return loggers[senderName];
};
