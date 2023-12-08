# Installation and configuration

!> Please note that **the following content is not of my creation**. It is a translated version of [**the French course from Uptime Formation**][uptime-formation].

!> In this particular section of the course, you will learn how to install Ansible, but it is important to note that **installing Ansible is not a requirement for the course projects**. \
Instead, this installation guide is provided for **knowledge purposes**, allowing you to familiarize yourself with the process.


There are several installation options:
- With the distribution's package manager or homebrew on OSX:
    - generally older version (2.4 or 2.6)
    - easy to update with the rest of the system
    - To install a recent version, there are specific repositories to add. \
    example on ubuntu: `sudo apt-add-repository --yes --update ppa:ansible/ansible`
- With `pip`, the python language package manager: sudo pip3 install
    - installs the latest stable version (currently 2.8)
    - specific upgrade command `sudo pip3 install ansible --upgrade`
    - allows you to easily install a development version to test new features or anticipate migrations.

To see all the files installed by a pip3 package: \
`pip3 show -f ansible | less`

To test connection to servers, use the following ad hoc command: `ansible all -m ping`


<br>


## Static inventories

This is a list of machines on which Ansible modules will run. The machines in this list are:
- the default syntax is that of INI configuration files
- Classified by group and sub-group, so that they can be collectively designated (e.g.: execute such-and-such an operation on machines in such-and-such a group).
- The connection method is specified either globally or for each machine.
- Variables can be defined for each machine or group to dynamically control ansible configuration later.

For example:
```ini
[all:vars]
ansible_ssh_user=elie
ansible_python_interpreter=/usr/bin/python3

[worker_nodes]
workernode1 ansible_host=10.164.210.101 pays=France

[dbservers]
pgnode1 ansible_host=10.164.210.111 pays=France
pgnode2 ansible_host=10.164.210.112 pays=Allemagne

[appservers]
appnode1 ansible_host=10.164.210.121
appnode2 ansible_host=10.164.210.122 pays=Allemagne
```

Inventories can also be in YAML format (more readable but not always intuitive) or JSON (for machines).


<br>


## Connection options
In the inventory, you often need to specify several options for logging in. Here are the main ones:
- `ansible_host`: essential, to tell Ansible how to access the host
- `ansible_user`: this is the user to be used by Ansible for SSH connections
- `ansible_ssh_private_key_file`: where to find the private key for the SSH connection
- `ansible_connection`: ask Ansible to use something other than SSH for the connection
- `ansible_python_interpreter=/usr/bin/python3`: option sometimes needed to tell Ansible where to find Python on the installed machine


<br>


## Configuration

Ansible is typically configured at the global level in the `/etc/ansible/` folder, which also contains the default inventory and configuration parameters.

Ansible is highly configurable to adapt to constrained environments. List of configuration parameters:

Alternatively, you can configure ansible on a project-by-project basis using the root `ansible.cfg` file. Any ansible command launched at the project root automatically retrieves this configuration.



[uptime-formation]: https://supports.uptime-formation.fr/06-ansible/cours1/