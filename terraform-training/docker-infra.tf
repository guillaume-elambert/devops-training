# Deploy a Docker compose infrastructure
terraform {
  required_providers {
    docker = {
      source = "kreuzwerker/docker"
    }
  }
}

provider "docker" {
  host = "unix:///var/run/docker.sock"
}

# Define Docker networks
resource "docker_network" "web" {
  name   = "web"
  driver = "bridge"
}

resource "docker_network" "lb" {
  name   = "lb"
  driver = "bridge"
}

# Define a variable "web_replicas" with a default value of 3
variable "web_replicas" {
  type    = number
  default = 3
}

# Define Docker images
resource "docker_image" "master" {
  name = "master"
  build {
    context    = "${path.module}/"
    dockerfile = "${path.module}/master.Dockerfile"
  }
}

resource "docker_image" "server" {
  name = "server"
  build {
    context    = "${path.module}/"
    dockerfile = "${path.module}/server.Dockerfile"
  }
}

# Define Docker containers
resource "docker_container" "master" {
  image       = docker_image.master.image_id
  name        = "master"
  working_dir = "/root/playbooks/"
  entrypoint  = ["/bin/sh", "-c", "tail -f /dev/null"]
  volumes {
    host_path      = abspath("${path.module}/master/playbooks")
    container_path = "/root/playbooks/"
  }
  volumes {
    host_path      = abspath("${path.module}/master/config")
    container_path = "/etc/ansible/"
  }
  networks_advanced {
    name = docker_network.web.name
  }
  networks_advanced {
    name = docker_network.lb.name
  }
}

resource "docker_container" "lb" {
  image = docker_image.server.image_id
  name  = "lb"
  ports {
    internal = 80
    external = 8080
  }
  networks_advanced {
    name = docker_network.lb.name
  }
}

resource "docker_container" "web" {
  count           = var.web_replicas
  image           = docker_image.server.image_id
  name            = "web-${count.index}"
  restart         = "on-failure"
  max_retry_count = 3
  networks_advanced {
    name = docker_network.web.name
  }
  networks_advanced {
    name = docker_network.lb.name
  }
}
