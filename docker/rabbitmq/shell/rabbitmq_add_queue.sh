#!/usr/bin/env bash

VIRTUAL_HOST=$1
QUEUE_NAME=$2
USER=$3
USER_PASSWORD=$4

#create exchange
rabbitmqadmin declare exchange --vhost=$VIRTUAL_HOST name=$QUEUE_NAME type=direct  -u $USER -p $USER_PASSWORD

#create queue
rabbitmqadmin declare queue --vhost=$VIRTUAL_HOST name=$QUEUE_NAME durable=true  -u $USER -p $USER_PASSWORD

#bind queue to exchange
rabbitmqadmin --vhost=$VIRTUAL_HOST declare binding source=$QUEUE_NAME destination_type=queue destination=$QUEUE_NAME -u $USER -p $USER_PASSWORD
