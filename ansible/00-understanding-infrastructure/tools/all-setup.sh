#!/bin/bash

# Get all the *-setup.sh (except all-setup.sh) scripts in the current directory
# and run them.
for script in $(ls -1 *-setup.sh | grep -v all-setup.sh); do
  echo "Running $script"
  ./$script
done