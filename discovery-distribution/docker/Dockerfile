FROM openjdk:8-jdk-alpine

ENV DISCOVERY_HOME=/opt/discovery

RUN addgroup -S metatron && adduser -S metatron -G metatron

COPY ../target/metatron-discovery-*-bin.tar.gz $DISCOVERY_HOME/

WORKDIR $DISCOVERY_HOME

RUN tar -xf metatron-discovery-*-bin.tar.gz --strip-components=1; \
    rm metatron-discovery-*-bin.tar.gz; \
    chown -R metatron:metatron .;

COPY ../docker/entrypoint.sh /
RUN chmod +x /entrypoint.sh

COPY ../bin/metatron.sh ${DISCOVERY_HOME}/bin
COPY ../bin/common.sh ${DISCOVERY_HOME}/bin
RUN chmod +x ${DISCOVERY_HOME}/bin/*

USER metatron:metatron

ENTRYPOINT ["/entrypoint.sh"]
EXPOSE 8180