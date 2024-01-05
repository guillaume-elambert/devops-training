# Create a copy of /etc/hosts
sudo cp -av /etc/hosts /etc/hosts.bak.$(date '+%d-%m-%Y_%H-%M')

# Add containers to /etc/hosts
docker inspect -f '{{$name:=slice .Name 1}}{{range .NetworkSettings.Networks}}{{with $ip:=.IPAddress}}{{$ip}} {{$name}}{{break}}{{end}}{{end}}' $(docker ps --filter name='^ansible-training_\w+_[0-9]+$' -q) >> /etc/hosts