#!/bin/bash
# Create a docker network connected to the host
docker network create ansible-host-network --driver host --attachable --scope local && \
docker-compose -f "/root/ansible-training/docker-compose.yml" --compatibility up -d