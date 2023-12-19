#!/bin/bash
apt update &&
apt upgrade -y docker-compose &&
docker-compose -f "/root/ansible-training/docker-compose.yml" --compatibility up -d