#!/bin/bash

# Get all the *-setup.sh (except all-setup.sh) scripts in the current directory
# and run them.
for script in $(ls -1 /tmp/tools/*-setup.sh | grep -v all-setup.sh); do
    # Make the script executable
    chmod +x $script
    echo "Running $script"
    
    # Remove the extension from the script name
    script_name=$(echo $script | sed 's/\(.*\)\..*/\1/')

    # Touch the script name to create the lock file
    touch $script_name.lock

    # Run the script then remove the lock file
    sudo bash $script && rm $script_name.lock
done

