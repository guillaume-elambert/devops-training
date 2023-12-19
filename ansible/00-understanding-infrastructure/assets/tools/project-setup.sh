#!/bin/bash
docker-compose -f "/root/ansible-training/docker-compose.yml" --compatibility up -d && \
docker connect host ansible-training_ansible_1