#!/bin/bash
export TOOLS_PATH=/root/tools

# Add the TOOLS_PATH to the user's .bashrc file
echo "export TOOLS_PATH=$TOOLS_PATH" >> /root/.bashrc

# Get all the /root/tools/*-setup.sh scripts in the current directory
# and run them.
for script in $(find $TOOLS_PATH -name '*-setup.sh'); do
    # Make the script executable
    echo $script
    chmod +x $script
    
    # Remove the extension from the script name
    script_name=$(echo $script | sed 's/\(.*\)\..*/\1/')

    # Touch the script name to create the lock file
    touch $script_name.lock

    # Run the script then remove the lock file
    sudo bash $script; rm $script_name.lock
done