#!/bin/sh

# Invoke script for stuff extra to the generic MongoDB docker image entrypoint
exec /usr/local/bin/mongos_runextra.sh &

# Run DockerHub's "official image" entrypoint now

cat /usr/local/bin/docker-entrypoint.sh

exec /usr/local/bin/docker-entrypoint.sh "$@"

