#!/bin/bash


compose_file=$(readlink -f "$(dirname "$(readlink -f $0)")/../docker-compose.yml")

# Check if the current directory is the script folder
if ! [[ -f "$compose_file" ]]; then
    # Print error explaining it should have a docker-compose file located at compose_file
    echo -e "\e[31mERROR: \e[0mdocker-compose.yml not found. It should be located at $compose_file"
    exit 1
fi

# If the docker compose is already running, stop it
if [[ $(docker compose -f "$compose_file" ps -q) ]]; then
    echo -e "\e[32mStopping docker-compose\e[0m"
    docker compose -f "$compose_file" down
    echo -e "\n"

    # Ensure the docker compose is running successfully
    if [[ $? -ne 0 ]]; then
        echo -e "\e[31mERROR: \e[0mFailed to stop docker-compose"
        exit 1
    fi
fi

# Starting docker compose
echo -e "\e[32mStarting docker-compose\e[0m"
docker compose -f "$compose_file" up -d

# Ensure the docker compose is running successfully
if [[ $? -ne 0 ]]; then
    echo -e "\e[31mERROR: \e[0mFailed to start docker-compose"
    exit 1
fi

# Launching the ansible playbook playbook.yml
echo -e "\n\e[32mLaunching ansible playbook\e[0m"
docker compose exec master ansible-playbook playbook.yml

# Ensure the ansible playbook has run successfully
if [[ $? -ne 0 ]]; then
    echo -e "\e[31mERROR: \e[0mFailed to run the playbook.yml playbook."
    exit 1
fi

echo -e "\n\e[32mYou can now access the project from http://localhost:8080\e[0m"