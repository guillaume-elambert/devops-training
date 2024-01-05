# Start the docker containers using docker-compose
docker-compose -f /root/ansible-training/docker-compose.yml --compatibility up -d

# Install Ansible and sshpass
apt install -y ansible sshpass