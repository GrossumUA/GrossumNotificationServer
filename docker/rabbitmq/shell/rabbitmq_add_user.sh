#!/usr/bin/env bash

DEFAULT_VIRTUAL_HOST=$1
VIRTUAL_HOST=$2
USER=$3
USER_PASSWORD=$4

rabbitmqctl add_user $USER $USER_PASSWORD
rabbitmqctl set_permissions -p $DEFAULT_VIRTUAL_HOST $USER ".*" ".*" ".*"
rabbitmqctl set_permissions -p $VIRTUAL_HOST $USER ".*" ".*" ".*"
rabbitmqctl set_user_tags $USER administrator