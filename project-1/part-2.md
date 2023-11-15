# Part 2 – Configure Ansible and create the playbooks

Now that our Docker infrastructure is in place, it's time to delve into the heart of our project by crafting the Ansible playbooks.
In this section, we will focus on configuring Ansible and developing the playbooks that will orchestrate the deployment and configuration of our web servers, load balancer, and any additional components.
These playbooks will serve as the directives for Ansible, guiding it in executing tasks on our containers, ensuring a cohesive and well-organized deployment.

Let's embark on this journey of creating powerful and efficient Ansible playbooks that will bring our project to life within the Dockerized environment.


## Configure Ansible

The first thing to get done is the configuration of Ansible for our project.

### Ansible inventory

To begin, we must create what is known as an inventory. 
This file essentially functions as a list of all the servers that Ansible should interact with.
Similar to the  `/etc/hosts` ile on Linux that maps IP addresses to domain names, an Ansible inventory file associates servers (IP addresses and/or domain names) with groups. \
The content of the Ansible inventory can be in either `ini` or `yaml` format.

For guidance on creating an inventory, refer to the [official documentation][ansible-inventory].

#### Get hostname for all containers

Before creating the inventory, let's retrieve the hostnames for all our containers. 
The [Docker CLI documentation][docker-ps] provides instructions on how to list all the containers on your host machine.

<question-container question="Use the Docker CLI to list all the containers available on your PC and identify those created for the Ansible infrastructure.">

```bash
# If your Docker Compose infrastructure is up and running, you can use:
$ docker ps

# If you haven't started Docker Compose, use:
$ docker ps -a
```

In the output, locate the containers with the names: `*-web-[0-9]+` and `*-lb-1`. \
In my case, it is `ansible-web-[0-9]+` and `ansible-lb-1`:
```bash
$ docker ps -a

CONTAINER ID   IMAGE            COMMAND                  CREATED       STATUS                     PORTS                                   NAMES
94a6be75089f   ansible-master   "/bin/sh -c 'tail -f…"   12 days ago   Exited (255) 12 days ago                                           ansible-master-1
13573728ca5c   ansible-web      "/usr/sbin/sshd -D"      12 days ago   Exited (255) 12 days ago                                           ansible-web-3
6eb59a8a9e48   ansible-web      "/usr/sbin/sshd -D"      12 days ago   Exited (255) 12 days ago                                           ansible-web-4
a1711121adfb   ansible-web      "/usr/sbin/sshd -D"      12 days ago   Exited (255) 12 days ago                                           ansible-web-2
b3c893158517   ansible-web      "/usr/sbin/sshd -D"      12 days ago   Exited (255) 12 days ago                                           ansible-web-5
71b5199a0ed8   ansible-web      "/usr/sbin/sshd -D"      12 days ago   Exited (255) 12 days ago                                           ansible-web-1
d0940852b78a   ansible-lb       "/usr/sbin/sshd -D"      12 days ago   Exited (255) 12 days ago   0.0.0.0:8080->80/tcp, :::8080->80/tcp   ansible-lb-1
```

</question-container>


#### Create a simple inventory

Now that we have the list of all the container names in the infrastructure, let's create the inventory file. \
Reviewing the [Ansible documentation][ansible-inventory] , you'll find two ways to create this file: using a `.ini` or a `.yml` format.
In our case, we will use the `ini` format.

To begin, create a `hosts.ini` file inside the `./master/config/` folder. Next, copy and paste all the container hostnames into the inventory.
Once this is done, you'll likely have an unorganized file, so let's establish some groups.

Groups are used to classify hosts either for distinct configuration purposes or to enable the execution of specific playbooks on designated devices later.

Considering the simplicity of our project, we'll define only three groups:

| Goup  |       Servers       |
| :---: | :-----------------: |
| `web` |    `*-lb-[0-9]+`    |
| `lb`  |      `*-lb-1`       |
| `all` | `web` + `lb` groups |

<question-container question="Adjust the Ansible inventory file to categorize hosts into groups.">

```ini
[lb]
ansible-lb-1

[web]
ansible-web-1
ansible-web-2
ansible-web-3
ansible-web-4
ansible-web-5

[all:children]
web
lb
```

The concept of `[all:children]` enables the creation of a group comprising the children of the groups specified below, in this instance, the groups `web` and `lb`.

</question-container>



## Deploy NGinx servers

Let's start by creating the playbook to deploy the NGinx servers.


[ansible-inventory]: https://docs.ansible.com/ansible/latest/inventory_guide/intro_inventory.html
[docker-ps]: https://docs.docker.com/engine/reference/commandline/docker/