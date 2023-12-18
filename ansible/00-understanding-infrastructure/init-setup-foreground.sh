#!/bin/bash
echo Waiting for all the setup scripts to finish...
# Get all the /tmp/tools/*-setup.sh (except all-setup.sh) scripts in the current directory
# Wait until there is no /tmp/tools/*-setup.lock file
while [ -f /tmp/tools/*-setup.lock ]; do
    sleep 1
done
echo All setup scripts have finished. You can now enjoy the infrastructure.