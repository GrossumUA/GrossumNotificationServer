#!/usr/bin/env bash

VIRTUAL_HOST=$1

rabbitmqctl add_vhost $VIRTUAL_HOST
