#!/bin/bash
#apt remove -y ansible sshpass & ( docker-compose -f /root/ansible-training/docker-compose.yml down && docker rmi -f $(docker image ls -q) ) &
#docker inspect -f '{{with $name:=slice .Name 1}}{{$name}}{{end}}' $(docker ps --filter name='^ansible-training_\w+_[0-9]+$' -q)

# Function to check if the background commands are successfull
check_commands_status() {
    local pids=("$@")
    
    for pid in "${pids[@]}"; do
        wait $pid
        local status=$?

        if [ $status -eq 0 ]; then
            echo "The command with PID $pid finished successfully."
        else
            # Output to stderr
            echo "Error: The command with PID $pid failed to run (exit code: $status)." >&2
            exit $status
        fi
    done
}

# Compare sh256 digest of file docker-ubuntu2204-ansible.tar.xz



# Get the path of this file
path=$(dirname "$0")

declare -a pids=()

# Declare the commands to run concurrently
# They are stored in the file "concurrent-commands.sh"
# We remove the comments and empty lines from the file
mapfile -t concurrent_commands < <(cat $path/concurrent-commands.sh | grep -v '^[[:space:]]*#' | grep -v '^[[:space:]]*$' | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')

# Declare the commands to run when the previous commands are done
# They are stored in the file "sequential-commands.sh"
# We remove the comments and empty lines from the file
mapfile -t sequential_commands < <(cat $path/sequential-commands.sh | grep -v '^[[:space:]]*#' | grep -v '^[[:space:]]*$' | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')


# Run the concurrent commands
for command in "${concurrent_commands[@]}"; do
    # Run the command in the background
    eval "( ( $command ) &> /dev/null ) &"
    
    # Get the PID of the last command run and add it to the array
    pid=$!
    pids+=($pid)
    
    echo "Running '$command' in the background (PID: $pid)"
done

# Waiting for all the commands to finish
check_commands_status "${pids[@]}"

# Run the sequential commands
for command in "${sequential_commands[@]}"; do
    # Run the command in the background
    echo "Running '$command'"
    eval $command
done