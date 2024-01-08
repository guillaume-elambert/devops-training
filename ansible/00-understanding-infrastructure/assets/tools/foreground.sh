#!/bin/bash
trap '' SIGINT
trap 'tput cnorm' EXIT
tput civis

NORMAL=$(tput sgr0)
GREEN=$(tput setaf 2)
YELLOW=$(tput setaf 3)
RED=$(tput setaf 1)

# Wait until there is no /root/tools/*-setup.lock file in the current directory and subdirectories
while [ $(find $TOOLS_PATH -name '*-setup.lock' | wc -l) -gt 0 ]; do
    had_lock=true

    for s in ▖ ▘ ▝ ▗; do 
        printf "\r%s\r" "${YELLOW}${s}  Waiting for all the setup scripts to finish...${NORMAL}"
        sleep 0.25
    done
done



if [ "$had_lock" = true ]; then
    stderr_file=/var/log/killercoda/background0_stderr.log

    # Check if the file /var/log/killercoda/background0_stderr.log has errors
    if [ $(cat $stderr_file | wc -l) -gt 0 ]; then
        printf "\r%s\r\n" "${YELLOW}There were errors while running the setup scripts. Please check the logs at '$stderr_file'.${NORMAL}"
    else
        printf "\r%s\r\n" "${GREEN}All setup scripts have finished. You can now enjoy the infrastructure!${NORMAL}"
    fi
    
fi

trap SIGINT
