FROM mongo:4.2.8

RUN apt-get update  -y && apt-get -q install -y

COPY --chown=mongodb:mongodb mongod_start.sh /usr/local/bin/
COPY --chown=mongodb:mongodb mongod_runextra.sh /usr/local/bin/
COPY --chown=mongodb:mongodb mongod.conf /etc/

RUN mkdir -p /data/db
RUN chown -R mongodb:mongodb /data
RUN chmod -R ugo+rw /data

RUN mkdir -p /var/lib/mongodb
RUN chown -R mongodb:mongodb /var/lib/mongodb
RUN chmod -R ugo+rw /var/lib/mongodb

RUN chmod u+x /usr/local/bin/mongod_start.sh /usr/local/bin/mongod_runextra.sh

ENTRYPOINT ["mongod_start.sh"]

CMD mongod -f /etc/mongod.conf 
