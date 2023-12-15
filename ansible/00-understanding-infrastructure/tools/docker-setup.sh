#!/bin/bash

# Check if docker is installed
if ! [ -x "$(command -v docker)" ]; then
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh ./get-docker.sh
  rm get-docker.sh
fi