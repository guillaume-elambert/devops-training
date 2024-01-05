#!/bin/bash
trap '' SIGINT
trap 'tput cnorm' EXIT
tput civis

NORMAL=$(tput sgr0)
GREEN=$(tput setaf 2)
YELLOW=$(tput setaf 3)
UNDERLINE=$(tput smul)

# Wait until there is no /root/tools/*-setup.lock file in the current directory and subdirectories
while [ $(find /root/tools/ -name '*-setup.lock' | wc -l) -gt 0 ]; do
    had_lock=true

    for s in ▖ ▘ ▝ ▗; do 
        printf "\r%s\r" "${YELLOW}${s}  Waiting for all the setup scripts to finish...${NORMAL}"
        sleep 0.25
    done
done

if [ "$had_lock" = true ]; then
    printf "\r%s\r\n" "${GREEN}All setup scripts have finished. You can now enjoy the infrastructure!${NORMAL}"
fi

trap SIGINT
