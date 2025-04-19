FROM mongo:4.2.8

RUN apt-get update  -y  && apt-get -q install -y

RUN mkdir -p /etc/clue-catalog
RUN chmod u+w /etc/clue-catalog

COPY --chown=mongodb:mongodb static-data /etc/clue-catalog/static-data
COPY --chown=mongodb:mongodb clean.js /etc/clue-catalog
COPY --chown=mongodb:mongodb setup.js /etc/clue-catalog
RUN chmod -R 755 /etc/clue-catalog