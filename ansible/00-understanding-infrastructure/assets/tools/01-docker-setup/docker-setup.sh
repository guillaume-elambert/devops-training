#!/bin/bash

# Check if docker is installed
if ! [ -x "$(command -v docker)" ]; then
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh ./get-docker.sh
  rm get-docker.sh
fi


docker load -i $TOOLS_PATH/01-docker-setup/docker-ubuntu2204-ansible.tar.gz