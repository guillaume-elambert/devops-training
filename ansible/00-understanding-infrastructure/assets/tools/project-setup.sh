#!/bin/bash
#apt remove -y ansible sshpass & ( docker-compose -f /root/ansible-training/docker-compose.yml down && docker rmi -f $(docker image ls -q) ) &
docker inspect -f '{{with $name:=slice .Name 1}}{{$name}}{{end}}' $(docker ps --filter name='^ansible-training_\w+_[0-9]+$' -q)

# Function to check if the background commands are successfull
check_commands_status() {
    local pids=("$@")
    
    for pid in "${pids[@]}"; do
        wait $pid
        local status=$?

        if [ $status -ne 0 ]; then
            echo "Error: The command with PID $pid failed to run (exit code: $status)"
            exit $status
        fi
    done
}

declare -a pids=()

# Declare the commands to run concurrently
declare -a concurrent_commands=(
    # Silent install of Ansible and sshpass
    'apt install -y ansible sshpass'
    # Start the docker containers using docker-compose
    'docker-compose -f /root/ansible-training/docker-compose.yml --compatibility up -d'
)

# Declare the commands to run when the previous commands are done
declare -a sequential_commands=(
    'sudo cp -av /etc/hosts /etc/hosts.bak.$(date '\''+%d-%m-%Y_%H-%M'\'')'
    # Add containers to /etc/hosts
    'docker inspect -f '\''{{with $name:=slice .Name 1}}{{range .NetworkSettings.Networks}}{{with $ip:=.IPAddress}}{{$ip}} {{$name}}{{break}}{{end}}{{end}}{{end}}'\'' $(docker ps --filter name='\''^ansible-training_\w+_[0-9]+$'\'' -q) >> /etc/hosts'
)

# Run the concurrent commands
for command in "${concurrent_commands[@]}"; do
    # Run the command in the background
    echo "$command"
    eval "( ( $command ) &> /dev/null ) &"
    
    # Get the PID of the last command run and add it to the array
    pid=$!
    pids+=($pid)
done

check_commands_status $pids
sleep 1

# Run the sequential commands
for command in "${sequential_commands[@]}"; do
    # Run the command in the background
    eval $command
done