FROM rabbitmq:3.6.5-management

ENV DEFAULT_VIRTUAL_HOST /
ENV VIRTUAL_HOST notification
ENV USER notification
ENV USER_PASSWORD notification

ADD shell /shell
ADD rabbitmqadmin /usr/local/bin/rabbitmqadmin

## @see https://github.com/docker-library/rabbitmq/issues/109
COPY rabbitmq.config /etc/rabbitmq/rabbitmq.config

RUN apt-get update && apt-get install python -y
RUN chmod +x /usr/local/bin/rabbitmqadmin

RUN chmod +x /shell/rabbitmq_add_vhost.sh
RUN chmod +x /shell/rabbitmq_add_user.sh
RUN chmod +x /shell/rabbitmq_add_queue.sh
RUN chmod +x /shell/rabbitmq_configure.sh

EXPOSE 5672 15671 15672

## @see http://stackoverflow.com/questions/30747469/how-to-add-initial-users-when-starting-a-rabbitmq-docker-container
## another way declare queue @see http://devops.datenkollektiv.de/creating-a-custom-rabbitmq-container-with-preconfigured-queues.html
CMD /shell/rabbitmq_configure.sh $DEFAULT_VIRTUAL_HOST $VIRTUAL_HOST $USER $USER_PASSWORD
