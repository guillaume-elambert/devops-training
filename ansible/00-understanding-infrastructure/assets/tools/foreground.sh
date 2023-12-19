#!/bin/bash
trap '' SIGINT
trap 'tput cnorm' EXIT
tput civis

NORMAL=$(tput sgr0)
GREEN=$(tput setaf 2)
YELLOW=$(tput setaf 3)
UNDERLINE=$(tput smul)


# Get all the /tmp/tools/*-setup.sh (except all-setup.sh) scripts in the current directory
# Wait until there is no /tmp/tools/*-setup.lock file
while [ -f /tmp/tools/*-setup.lock ];do 
    for s in ▖ ▘ ▝ ▗; do 
        printf "\r%s\r" "${YELLOW}${s}  Waiting for all the setup scripts to finish...${NORMAL}"
        # remove any char that might be after the pritf above
        sleep 0.25
    done
done

printf "\r%s\r\n" "${GREEN}All setup scripts have finished. You can now enjoy the infrastructure.${NORMAL}"

trap SIGINT
