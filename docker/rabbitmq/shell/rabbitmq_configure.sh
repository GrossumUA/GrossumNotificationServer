#!/usr/bin/env bash

DEFAULT_VIRTUAL_HOST=$1
VIRTUAL_HOST=$2
USER=$3
USER_PASSWORD=$4

service rabbitmq-server start

/bin/bash /shell/rabbitmq_add_vhost.sh $VIRTUAL_HOST
/bin/bash /shell/rabbitmq_add_user.sh $DEFAULT_VIRTUAL_HOST $VIRTUAL_HOST $USER $USER_PASSWORD
/bin/bash /shell/rabbitmq_add_queue.sh $VIRTUAL_HOST send-web-push $USER $USER_PASSWORD

service rabbitmq-server stop

rabbitmq-server