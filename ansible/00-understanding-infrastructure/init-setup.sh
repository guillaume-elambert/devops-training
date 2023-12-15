#!/bin/bash

# Check if docker is installed, if not install it
if ! [ -x "$(command -v docker)" ]; then
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh ./get-docker.sh
  rm get-docker.sh
fi

# Install Ansible
apt -y install ansible

# Create ansible-training directory
mkdir -p /root/ansible-training && cd /root/ansible-training