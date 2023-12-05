# From hacky to standard

The objective of this section is to align our current setup with Ansible standards.

?> Throughout this part, I recommend consulting online documentation, such as [this tutorial from DigitalOcean][tuto-ansible-roles].

## What is an Ansible role and its purpose

A role is a way of organizing tasks, handlers, files, and templates in Ansible. \
Roles are stored in the `roles/` directory, and are typically executed by playbook files, which are stored in the `playbooks/` directory.

A role is the primary mechanism for breaking a playbook into multiple files. \
This simplifies writing complex playbooks, and it makes them easier to reuse.


<br>


## Create a `common` role

The initial step involves creating a role that will serve as the foundation for all subsequent roles. \
Its primary purpose is to eliminate the need for the `ansible_ssh_user` and `ansible_ssh_pass` variables in the Ansible inventory.

### Generate the role structure using `ansible-galaxy`

To create a role there are 2 options :
1. Create the file structure manually
2. Use the built-in tool: `ansible-galaxy`

[`ansible-galaxy` is a CLI tool][ansible-galaxy-doc] that allows us to manage roles and collections of roles for Ansible. It also provides the capability to share these creations on [an online repository][ansible-galaxy-website], such as Docker Hub.

Assuming you are at the root of the project, start by creating the `roles` directory:
```bash
# Create the folder that will contain the roles
$ mkdir ./master/playbooks/roles
```

Now, use the `ansible-galaxy` command to generate the file structure for the "common" role:
```bash
# Generate the file structure for the "common" role.
$ ansible-galaxy init common --offline
```

The resulting file architecture will look something like this:
```treeview
common/
|-- README.md*
|-- defaults/
|   `-- main.yml*
|-- files/
|-- handlers/
|   `-- main.yml*
|-- meta/
|   `-- main.yml*
|-- tasks/
|   `-- main.yml*
|-- templates/
|-- tests/
|   |-- inventory*
|   `-- test.yml*
`-- vars/
    `-- main.yml*
```

### Configure the `common` role

Now that we have our role, the next step is to configure it. \
In our case, we don't have to do much other than define the necessary variables in `common/defaults/main.yml` or `common/vars/main.yml`:
```yml
---
# defaults file for common

# The user and password to use when connecting through SSH
ansible_ssh_user: root
ansible_ssh_pass: ansible
```





[tuto-ansible-roles]: https://www.digitalocean.com/community/tutorials/how-to-use-ansible-roles-to-abstract-your-infrastructure-environment
[ansible-galaxy-doc]: https://docs.ansible.com/ansible/latest/cli/ansible-galaxy.html
[ansible-galaxy-website]: https://galaxy.ansible.com/