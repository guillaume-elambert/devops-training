# From hacky to standard

The objective of this section is to align our current setup with Ansible standards.

?> Throughout this part, I recommend consulting online documentation, such as [this tutorial from DigitalOcean][tuto-ansible-roles].

## What is an Ansible role and its purpose

A role is a way of organizing tasks, handlers, files, and templates in Ansible. \
Roles are stored in the `roles/` directory, and are typically executed by playbook files, which are stored in the `playbooks/` directory.

A role is the primary mechanism for breaking a playbook into multiple files. \
This simplifies writing complex playbooks, and it makes them easier to reuse.


<br>

----


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
# The "--offline" parameter is specified so we do not query the galaxy API 
$ docker compose exec master ansible-galaxy init ./roles/common --offline
```

The resulting file structure will look something like this:
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


<br>

----


##  Create a `nginx` role

### Generate the role structure using `ansible-galaxy`

Like with the `common` role, we will create the file structure using `ansible-galaxy`.

<question-container question="Use <code>ansible-galaxy</code> to create the file structure for the <code>nginx</code> role.">

```bash
$ docker compose exec master ansible-galaxy init ./roles/nginx --offline
```

</question-container>


### Configure the `nginx` role

To make our project compliant with standards, we'll need to divide the `nginx.yml` playbook into two directories generated with `ansible-galaxy`:
- `tasks`: This directory will contain all the main tasks to be executed by the role.
- `handlers`: Here, we will include all the handlers that respond to events triggered by the tasks of the role.

<question-container question="Split the <code>nginx.yml</code> playbook to match the standards.">

Assuming you are in the directory `ansible-training/master/playbooks/roles/nginx/`, you should have modified the files `./tasks/main.yml` and `./handlers/main.yml` 

<!-- tabs:start -->
<!-- tab:`./tasks/main.yml` -->
```yml
---
# tasks file for ./roles/nginx

- name: Install NGINX
  become: yes
  apt:
    update_cache: true
    name: nginx
    state: present

- name: Copy NGINX config files
  copy:
    src: /root/slaves/nginx/config/
    dest: /etc/nginx/
    force: true
    
- name: Making index.html file
  template:
    src: /root/slaves/nginx/index.html.j2
    dest: /var/www/html/index.html
  notify:
    - Restart Nginx
```

<!-- tab:`./handlers/main.yml` -->
```yml
---
# handlers file for ./roles/nginx

- name: Restart Nginx
  become: true
  service:
    name: nginx
    state: restarted
    enabled: true
```

<!-- tabs:end -->

</question-container>

<br>

The next step is to move the files used by the `nginx.yml` playbook (from `ansible-training/slaves/nginx/` folder) in the appropriate directory of the `nginx` role:
- `templates`: Will contain all the Jinja2 template files
- `files`: Will contain all the files that are not templates

<question-container question="Move the files from the directory <code>ansible-training/slaves/nginx/</code> to the appropriate location within the <code>nginx</code> role.">

You should have moved the `index.html.j2` into the `template` directory and all other files and folders within the `files` directory. \
The resulting file architecture should look like this:

```treeview
nginx/
|-- README.md*
|-- defaults/
|   `-- main.yml*
|-- files/
|   |-- config/
|   |   `-- sites-enabled/
|   |       `-- default*
|   `-- nginx.conf*
|-- handlers/
|   `-- main.yml*
|-- meta/
|   `-- main.yml*
|-- tasks/
|   `-- main.yml*
|-- templates/
|   `-- index.html.j2*
|-- tests/
|   |-- inventory*
|   `-- test.yml*
`-- vars/
    `-- main.yml*
```

</question-container>

<br>

After relocating the files and folders, the tasks of the `nginx` has been disrupted. \
You'll need to modify the paths to access the various files in the `roles/nginx/tasks/main.yml` file.

<question-container question="Edit the <code>roles/nginx/tasks/main.yml</code> file to accommodate the changes made to the file structure of the <code>nginx</code> role.">

In the file `roles/nginx/tasks/main.yml`, ensure that all references to `/root/slaves/nginx` have been removed. \
Adapt the folder path accordingly based on whether the task involves templates or standards files.

```yml
---
# tasks file for ./roles/nginx

- name: Install NGINX
  become: yes
  apt:
    update_cache: true
    name: nginx
    state: present

- name: Copy NGINX config files
  copy:
    src: files/config/
    dest: /etc/nginx/
    force: true
    
- name: Making index.html file
  template:
    src: templates/index.html.j2
    dest: /var/www/html/index.html
  notify:
    - Restart Nginx
```

</question-container>

<br>

Now that tasks are prepared, we need to integrate the `ansible_ssh_user` and `ansible_ssh_pass` variables previously defined in the `common` role into the `nginx` role, otherwise Ansible will not be able to access the servers.
To achieve this, we will leverage the `meta` folder.
Within the default `main.yml` file generated with `ansible-galaxy`, there are some default values that do not concern us. Our focus is solely on the `dependencies` list.
This list serves as a means for Ansible to establish a role's inheritance from another.
Considering we have declared the `ansible_ssh_user` and `ansible_ssh_pass` variables in the `common` role, we want the `nginx` role to depend on it.


<question-container question="Configure the <code>nginx</code> role to depend on the <code>common</code> role.">

The resulting `ansible-training/master/playbooks/roles/nginx/meta/main.yml` file should look something like:

```yml
galaxy_info:
  author: Guillaume ELAMBERT
  description: Simple role to deploy NGINX

  # If the issue tracker for your role is not on github, uncomment the
  # next line and provide a value
  # issue_tracker_url: http://example.com/issue/tracker

  # Choose a valid license ID from https://spdx.org - some suggested licenses:
  # - BSD-3-Clause (default)
  # - MIT
  # - GPL-2.0-or-later
  # - GPL-3.0-only
  # - Apache-2.0
  # - CC-BY-4.0
  license: license (GPL-2.0-or-later, MIT, etc)

  min_ansible_version: 2.1

  # If this a Container Enabled role, provide the minimum Ansible Container version.
  # min_ansible_container_version:

  #
  # Provide a list of supported platforms, and for each platform a list of versions.
  # If you don't wish to enumerate all versions for a particular platform, use 'all'.
  # To view available platforms and versions (or releases), visit:
  # https://galaxy.ansible.com/api/v1/platforms/
  #
  # platforms:
  # - name: Fedora
  #   versions:
  #   - all
  #   - 25
  # - name: SomePlatform
  #   versions:
  #   - all
  #   - 1.0
  #   - 7
  #   - 99.99

  galaxy_tags: []
    # List tags for your role here, one per line. A tag is a keyword that describes
    # and categorizes the role. Users find roles by searching for tags. Be sure to
    # remove the '[]' above, if you add tags to this list.
    #
    # NOTE: A tag is limited to a single word comprised of alphanumeric characters.
    #       Maximum 20 tags per role.

dependencies:
  - role: common
  # List your role dependencies here, one per line. Be sure to remove the '[]' above,
  # if you add dependencies to this list.
```

</question-container>


<br>

----


## Create a `haproxy` role

Use the same logic as above to adapt the "hacky" `haproxy.yml` file and its dependent files to an Ansible role.

<question-container question="Create and configure the <code>haproxy</code> role.">

You should have created the `haproxy` role using the following command:
```bash
$ docker compose exec master ansible-galaxy init ./roles/haproxy --offline
```

<br>

Then you should have moved the files related to the tasks. In this case, there is only one: the `haproxy.cfg.j2` template. \
The file architecture of the role should look like this:

```treeview
haproxy/
|-- README.md*
|-- defaults/
|   `-- main.yml*
|-- handlers/
|   `-- main.yml*
|-- meta/
|   `-- main.yml*
|-- tasks/
|   `-- main.yml*
|-- templates/
|   `-- haproxy.cfg.j2*
|-- tests/
|   |-- inventory*
|   `-- test.yml*
`-- vars/
    `-- main.yml*
```

<br>

Now, assuming you are in the directory `ansible-training/master/playbooks/roles/haproxy`, the files to be modified are the following:
- `./tasks/main.yml`
- `./handlers/main.yml`
- `./defaults/main.yml`
- `./meta/main.yml`

Their content should be something like:

<!-- tabs:start -->
<!-- tab:`./tasks/main.yml` -->
```yml
---
# tasks file for ./roles/haproxy

- name: Install HAProxy
  apt:
    name: haproxy
    update_cache: true
    state: present

- name: Configure HAProxy 
  template:
    src: templates/haproxy.cfg.j2
    dest: /etc/haproxy/haproxy.cfg
  notify:
    - Restart HAProxy
```

<!-- tab:`./handlers/main.yml` -->
```yml
---
# handlers file for ./roles/haproxy

- name: Restart HAProxy
  become: true
  service:
    name: haproxy
    state: restarted
    enabled: true
```

<!-- tab:`./defaults/main.yml` -->
I hope you haven't forgotten the `haproxy_port` defined in the Ansible inventory and used in the `haproxy.cfg.j2` template. \
Any variables specific to a role should be declared in the `defaults/main.yml` or `vars/main.yml` of that particular role. The variable `haproxy_port` is no exception to this rule.

```yml
---
# defaults file for ./roles/haproxy

# The port used by HAProxy
haproxy_port: 80
```

<!-- tab:`./meta/main.yml` -->
```yml
galaxy_info:
  author: Guillaume ELAMBERT
  description: Simple role to deploy HAProxy

  # If the issue tracker for your role is not on github, uncomment the
  # next line and provide a value
  # issue_tracker_url: http://example.com/issue/tracker

  # Choose a valid license ID from https://spdx.org - some suggested licenses:
  # - BSD-3-Clause (default)
  # - MIT
  # - GPL-2.0-or-later
  # - GPL-3.0-only
  # - Apache-2.0
  # - CC-BY-4.0
  license: license (GPL-2.0-or-later, MIT, etc)

  min_ansible_version: 2.1

  # If this a Container Enabled role, provide the minimum Ansible Container version.
  # min_ansible_container_version:

  #
  # Provide a list of supported platforms, and for each platform a list of versions.
  # If you don't wish to enumerate all versions for a particular platform, use 'all'.
  # To view available platforms and versions (or releases), visit:
  # https://galaxy.ansible.com/api/v1/platforms/
  #
  # platforms:
  # - name: Fedora
  #   versions:
  #   - all
  #   - 25
  # - name: SomePlatform
  #   versions:
  #   - all
  #   - 1.0
  #   - 7
  #   - 99.99

  galaxy_tags: []
    # List tags for your role here, one per line. A tag is a keyword that describes
    # and categorizes the role. Users find roles by searching for tags. Be sure to
    # remove the '[]' above, if you add tags to this list.
    #
    # NOTE: A tag is limited to a single word comprised of alphanumeric characters.
    #       Maximum 20 tags per role.

dependencies:
  - role: common
  # List your role dependencies here, one per line. Be sure to remove the '[]' above,
  # if you add dependencies to this list.
```

<!-- tabs:end -->

</question-container>


[tuto-ansible-roles]: https://www.digitalocean.com/community/tutorials/how-to-use-ansible-roles-to-abstract-your-infrastructure-environment
[ansible-galaxy-doc]: https://docs.ansible.com/ansible/latest/cli/ansible-galaxy.html
[ansible-galaxy-website]: https://galaxy.ansible.com/