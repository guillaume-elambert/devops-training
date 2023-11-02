FROM geerlingguy/docker-ubuntu2204-ansible

RUN apt-get update && apt-get install -y vim net-tools telnet curl sshpass
RUN ln -s /usr/bin/python3 /usr/bin/python