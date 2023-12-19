#!/bin/bash
docker-compose -f "/root/ansible-training/docker-compose.yml" --compatibility up -d && \
docker network connect host ansible-training_lb_1