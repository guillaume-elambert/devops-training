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

In the output, locate the containers with the names: `*-web-[0-9]+` and `*-lb-1`.

?> The nomenclature of the containers is contingent on the name of the folder housing the  `docker-compose.yml` file. \
For instance, if the folder is named `awesome-training`and two replicas of a service named `awesomeservice` are created the resulting containers will be named `awesome-training-awesomeservice-1` and `awesome-training-awesomeservice-2`.

In my case, it is `ansible-training-web-[0-9]+` and `ansible-training-lb-1`:
```bash
$ docker ps -a

CONTAINER ID   IMAGE            COMMAND                  CREATED       STATUS                     PORTS                                   NAMES
94a6be75089f   ansible-training-master   "/bin/sh -c 'tail -f…"   12 days ago   Exited (255) 12 days ago                                           ansible-training-master-1
13573728ca5c   ansible-training-web      "/usr/sbin/sshd -D"      12 days ago   Exited (255) 12 days ago                                           ansible-training-web-3
6eb59a8a9e48   ansible-training-web      "/usr/sbin/sshd -D"      12 days ago   Exited (255) 12 days ago                                           ansible-training-web-4
a1711121adfb   ansible-training-web      "/usr/sbin/sshd -D"      12 days ago   Exited (255) 12 days ago                                           ansible-training-web-2
b3c893158517   ansible-training-web      "/usr/sbin/sshd -D"      12 days ago   Exited (255) 12 days ago                                           ansible-training-web-5
71b5199a0ed8   ansible-training-web      "/usr/sbin/sshd -D"      12 days ago   Exited (255) 12 days ago                                           ansible-training-web-1
d0940852b78a   ansible-training-lb       "/usr/sbin/sshd -D"      12 days ago   Exited (255) 12 days ago   0.0.0.0:8080->80/tcp, :::8080->80/tcp   ansible-training-lb-1
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

| Group |       Servers       |
| :---: | :-----------------: |
| `web` |    `*-lb-[0-9]+`    |
| `lb`  |      `*-lb-1`       |
| `all` | `web` + `lb` groups |

<question-container question="Adjust the Ansible inventory file to categorize hosts into groups.">

```ini
[lb]
ansible-training-lb-1

[web]
ansible-training-web-1
ansible-training-web-2
ansible-training-web-3
ansible-training-web-4
ansible-training-web-5

[all:children]
web
lb
```

The concept of `[all:children]` enables the creation of a group comprising the children of the groups specified below, in this instance, the groups `web` and `lb`.

</question-container>

<br>

Now that we have told Ansible about all the servers it can access, the next step is to specify how it will access them - specifically, which user and password to use.
To accomplish this, we will utilize variables within the inventory.
There are two ways to define these variables:
1. Create a variable to a specific host.
2. Assign a variable to all the hosts of a group

Given that the **same image is used for all containers**, and the `root` user is specified in its `server.Dockerfile` with the password `ansible`, **uniformity is maintained across all containers**.
This allows us to **establish a universal SSH user and password** for all the hosts. 
To accomplish this, we will use the second method for defining variables - assigning variables to a group.

?> For information on how to declare variables, consult the [official documentation][ansible-inventory].

?> To determine which variables to declare, while there is no specific documentation, you can easily find relevant information through online searches.

<question-container question="Edit the <code>hosts.ini</code> file to add variables specifying the user and password to use when Ansible connects through SSH to the servers.">

```ini
[lb]
ansible-training-lb-1

[web]
ansible-training-web-1
ansible-training-web-2
ansible-training-web-3
ansible-training-web-4
ansible-training-web-5

[all:children]
web
lb

[all:vars]
ansible_ssh_user=root
ansible_ssh_pass=ansible
```

</question-container>


<br>


### Ansible configuration

The main Ansible configuration is within [the `ansible.cfg` file][ansible-cfg]. \
Refering to the [official documentation][ansible-cfg] you can either create a file from scratch or generate a template file using the command:
```bash
$ ansible-config init --disabled > ansible.cfg
```

In our case, Ansible is not installed on the PC; it resides within the `master` container. \
While you can generate the configuration file form the container and retrieve its content to copy/paste on your PC, extensive Ansible configuration is unnecessary for our project.

Given the simplicity of our project, there isn't much to specify in the configuration. The only essential task is to **disable SSH key check** between Ansible and the hosts; otherwise, Ansible won't connect to the servers at all.
Setting up a key for the `master` container and registering it in the `.ssh/known_hosts` file of each host would be time-consuming for an initial hands-on experience with Ansible, where security standards are not our primary concern.

?> **<ins>Reminder:</ins>** The list of all available Ansible settings is accessible [here][ansible-cfg].


<question-container question="Use the official documentation to configure the <code>ansible.cfg</code> file.">

As explained in the [official documentation][ansible-cfg], the parameter `host_key_checking` does the following : 
> Enables host key checking by the underlying tools Ansible uses to connect to the targets.

<br>

The resulting content for the `./master/config/ansible.cfg` file :
```ini
[defaults]
host_key_checking = false
remote_user = root
```

</question-container>


In the solution given above we do specify to Ansible which user to use when connecting through SSH to the servers but not the password. To by pass this issue, we will have to edit the inventory.


<br>

## Creating playbooks


### NGINX playbook

Let's start by creating the playbook to deploy the NGINX servers.

First of all, we need to determine on which `hosts` we want the playbook to run: the `web` group defined in the inventory at the [Question 2][question-2]. \
Then we have to think about the tasks we want to execute :
1. Install NGINX using `apt`
2. Configure NGINX
3. Add web application to the server
4. Start the NGINX server

Hopefully, we do not have to do every thing manually since Ansible uses 'modules' to help us interract with the remote servers. \
Each module does a simple task on the remote server. You can find a [list of most of available modules in the official documentation][ansible-modules].

Let's proceed task by task :

<question-container question="Create the <code>./master/playbooks/nginx.yml</code> file and use the <code>apt</code> module to install NGINX.">

```yml
- hosts: web
  tasks:
    - name: Install NGINX
      become: yes
      apt:
        update_cache: true
        name: nginx
        state: present
```

</question-container>

<br>

<question-container question="Edit the <code>./master/playbooks/nginx.yml</code> file so it copies the content of the <code>./slaves/nginx/config/</code> folder into the NGINX configuration directory.">

According to the [NGINX Beginner’s Guide][nginx-beginners-guide], the configuration folder of NGINX depends on the package system used to install NGINX and the operating system. \
After some Googling and some research in the file system, it appears that using `apt` in Ubuntu (the base of our container image), the configuration folder is `/etc/nginx/`.

```yml
- hosts: web
  tasks:
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
```

</question-container>


<br>


Before writting the next task, we need to focus on the [template module][template-module-guide]. \
This module uses Jinja2 templating to create dynamic files. In our case, we will create a simple `index.html` file on each NGINX server that will show the name of the server. \
As this is a bit technical and is not the main purpose of the project, I give you the response on how to create the template file :
1. On your PC, create a file named `index.html.j2` in the folder `./slaves/nginx/`
2. Copy and paste this line to the file : `Hello! You are connected to {{ inventory_hostname }}.`

Once the file processed by Ansible, the placeholder `{{ inventory_hostname }}` will be replaced by the name of the container it is deployed on. \
So, in my case :
1. `Hello! You are connected to ansible-training-web-1.`
2. `Hello! You are connected to ansible-training-web-2.`
3. `Hello! You are connected to ansible-training-web-3.`
4. `Hello! You are connected to ansible-training-web-4.`
5. `Hello! You are connected to ansible-training-web-5.`

For further guidance, consult [the template module guide][template-module-guide] or refer to [the official template module documentation][template-module]. \
To understand where NGINX looks for HTML documents on Ubuntu, you can review  [this tutorial from ubuntu.com][nginx-ubuntu-html].

<question-container question="Edit the <code>./master/playbooks/nginx.yml</code> file so it creates the <code>index.html</code> using the <code>index.html.j2</code> template created above.">

```yml
- hosts: web
  tasks:
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
```

</question-container>

<br>

?> **<ins>Reminder:</ins>** The list of Ansible modules is available [here][ansible-modules].

?> **<ins>Hint:</ins>** For the next question, we won't follow the instructions outlined in the [official beginners guide of NGINX][nginx-beginners-guide]. Instead, we will use the standard way with `systemctl`.

<question-container question="Identify the Ansible module that will help us start the NGINX server, then add the corresponding task to the <code>./master/playbooks/nginx.yml</code> playbook.">

If you've been attentive, I already provided the solution in the [Creating the Dockerfiles][creating-the-dockerfiles] section of the first project part: we will use the [service module][service-module].\
In the following configuration, the task involves restarting the server with `sudo` privileges.

```yml
- hosts: web
  tasks:
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

    - name: Restart NGINX
      become: true
      service:
        name: nginx
        state: restarted
        enabled: true
```

</question-container>

#### Testing

The NGINX playbook is now complete. \
To test it, follow these steps:
1. **<ins>Run the playbook:</ins>** Run the command `docker compose exec master ansible-playbook nginx.yml`. If you encounter errors, consider adding the following options at the end of the command for debugging: `-vvv --diff`.
2. **<ins>Check NGINX status:</ins>** Use the command `docker compose exec web service nginx status` to confirm that NGINX is running.

Unfortunately, due to the separation of our web servers from the host machine network in our  `docker-compose.yml` file, we cannot access the NGINX servers from our web browser. \
Fortunatly, the `master` container has access to them, allowing us to use `curl` to check that everything is working as expected. Use the following command to check the `index.html` file served by NGINX servers :
```bash
# Get the 'index.html' file deployed on the 'ansible-training-web-1' container
$ docker composer exec master curl ansible-training-web-1

Hello! You are connected to ansible-training-web-1.
```


<br>


### HAProxy playbook

Now that we have created the Ansible playbook to deploy NGINX servers, it is time to do the same with HAProxy. \
This playbook will be shorter than the one above.

The first thing to start with is to install the HAProxy server using the `apt` module :


<question-container question="Create the <code>./master/playbooks/haproxy.yml</code> file and use the <code>apt</code> module to install HAProxy.">

```yml
- hosts: dev_lb
  tasks:
    - name: Install HAProxy
      apt:
        name: haproxy
        update_cache: true
        state: present
```

</question-container>


The next step is to configure the HAProxy server.

<details>
<summary title="Click to see the default HAProxy configuration file.">
<strong>To create the HAProxy configuration template using Jinja2 and Ansible**, we will use the following file as a starting point.</strong>
</summary>

```haproxy.cfg
#---------------------------------------------------------------------
# Example configuration for a possible web application.  See the
# full configuration options online.
#
#   https://www.haproxy.org/download/1.8/doc/configuration.txt
#
#---------------------------------------------------------------------

#---------------------------------------------------------------------
# Global settings
#---------------------------------------------------------------------
global
    # to have these messages end up in /var/log/haproxy.log you will
    # need to:
    #
    # 1) configure syslog to accept network log events.  This is done
    #    by adding the '-r' option to the SYSLOGD_OPTIONS in
    #    /etc/sysconfig/syslog
    #
    # 2) configure local2 events to go to the /var/log/haproxy.log
    #   file. A line like the following can be added to
    #   /etc/sysconfig/syslog
    #
    #    local2.*                       /var/log/haproxy.log
    #
    log         127.0.0.1 local2

    chroot      /var/lib/haproxy
    pidfile     /var/run/haproxy.pid
    maxconn     4000
    user        haproxy
    group       haproxy
    daemon

    # turn on stats unix socket
    stats socket /var/lib/haproxy/stats

    # utilize system-wide crypto-policies
    ssl-default-bind-ciphers PROFILE=SYSTEM
    ssl-default-server-ciphers PROFILE=SYSTEM

#---------------------------------------------------------------------
# common defaults that all the 'listen' and 'backend' sections will
# use if not designated in their block
#---------------------------------------------------------------------
defaults
    mode                    http
    log                     global
    option                  httplog
    option                  dontlognull
    option http-server-close
    option forwardfor       except 127.0.0.0/8
    option                  redispatch
    retries                 3
    timeout http-request    10s
    timeout queue           1m
    timeout connect         10s
    timeout client          1m
    timeout server          1m
    timeout http-keep-alive 10s
    timeout check           10s
    maxconn                 3000

#---------------------------------------------------------------------
# main frontend which proxys to the backends
#---------------------------------------------------------------------
frontend main 
    bind                        *:5000
    default_backend             app

#---------------------------------------------------------------------
# round robin balancing between the various backends
#---------------------------------------------------------------------
backend app
    balance     roundrobin
    server  app1 127.0.0.1:5001 check
    server  app2 127.0.0.1:5002 check
    server  app3 127.0.0.1:5003 check
    server  app4 127.0.0.1:5004 check
```
</details>


The two sections relevant to us in the provided file are the last two.

The main `frontend which proxies to the backends` part enables us to specify the port used by HAProxy and define the default backend fallback.

The final section pertains to the configuration of the backend. Here, we can instruct HAProxy on which servers to load balance when users try to access the `app` backend.

Before moving on to configuring haproxy, we're going to add a variable to Ansible's configuration to allow us to easily modify the port dedicated to the proxy. We'll call this variable `haproxy_port`.
Now we need from Ansible that it declares the port depending on a variable you will declare in Ansible : the `haproxy_port` variable.

<question-container question="Edit the Ansible inventory to declare the <code>haproxy_port</code> variable. Set the value to <code>8080</code>.">

```ini
[lb]
ansible-training-lb-1

[web]
ansible-training-web-1
ansible-training-web-2
ansible-training-web-3
ansible-training-web-4
ansible-training-web-5

[all:children]
web
lb

[all:vars]
ansible_ssh_user=root
ansible_ssh_pass=ansible
haproxy_port=8080
```

</question-container>

Now that we have defined the `haproxy_port` variable it is time to create the `haproxy.cfg.j2` file and integrate the variable into it. \
The file `haproxy.cfg.j2` should be created within the folder `./slaves/haproxy`

To do so, you can refer to [the template module guide from Ansible][template-module-guide]. It gives you useful links, including [documentation about variables][ansible-variables], [the list of available facts and variables][ansible-facts], [the list of available special variables][ansible-special-variables] and [the Jinja2 documentation][jinja-template-documentation].


<question-container question="Copy the provided HAProxy configuration and adapt it to use the <code>haproxy_port</code> variable to define the port used by HAProxy.">

Thanks to the following configuration, we set the port used by HAProxy using the Ansible inventory. \
Details about the servers will be defined in the following question.

```haproxy.cfg
#---------------------------------------------------------------------
# Example configuration for a possible web application.  See the
# full configuration options online.
#
#   https://www.haproxy.org/download/1.8/doc/configuration.txt
#
#---------------------------------------------------------------------

#---------------------------------------------------------------------
# Global settings
#---------------------------------------------------------------------
global
    # to have these messages end up in /var/log/haproxy.log you will
    # need to:
    #
    # 1) configure syslog to accept network log events.  This is done
    #    by adding the '-r' option to the SYSLOGD_OPTIONS in
    #    /etc/sysconfig/syslog
    #
    # 2) configure local2 events to go to the /var/log/haproxy.log
    #   file. A line like the following can be added to
    #   /etc/sysconfig/syslog
    #
    #    local2.*                       /var/log/haproxy.log
    #
    log         127.0.0.1 local2

    chroot      /var/lib/haproxy
    pidfile     /var/run/haproxy.pid
    maxconn     4000
    user        haproxy
    group       haproxy
    daemon

    # turn on stats unix socket
    stats socket /var/lib/haproxy/stats

    # utilize system-wide crypto-policies
    ssl-default-bind-ciphers PROFILE=SYSTEM
    ssl-default-server-ciphers PROFILE=SYSTEM

#---------------------------------------------------------------------
# common defaults that all the 'listen' and 'backend' sections will
# use if not designated in their block
#---------------------------------------------------------------------
defaults
    mode                    http
    log                     global
    option                  httplog
    option                  dontlognull
    option http-server-close
    option forwardfor       except 127.0.0.0/8
    option                  redispatch
    retries                 3
    timeout http-request    10s
    timeout queue           1m
    timeout connect         10s
    timeout client          1m
    timeout server          1m
    timeout http-keep-alive 10s
    timeout check           10s
    maxconn                 3000

#---------------------------------------------------------------------
# main frontend which proxys to the backends
#---------------------------------------------------------------------
frontend main 
    bind                        *:{{ haproxy_port }}
    default_backend             app

#---------------------------------------------------------------------
# round robin balancing between the various backends
#---------------------------------------------------------------------
backend app
    balance     roundrobin
    server  app1 127.0.0.1:5001 check
    server  app2 127.0.0.1:5002 check
    server  app3 127.0.0.1:5003 check
    server  app4 127.0.0.1:5004 check
```

</question-container>

The final step in configuring HAProxy is to instruct Ansible to integrate the list of NGINX servers stored in its inventory into the configuration file.

To achieve this, consult the following documentation:
- [Ansible template module guide][template-module-guide]
- [Ansible variables documentation][ansible-variables]
- [List of available Ansible facts and variables][ansible-facts]
- [List of available special variables in Ansible][ansible-special-variables]
- [Jinja2 documentation][jinja-template-documentation].


<question-container question="Edit the <code>./slaves/haproxy/haproxy.cfg.j2</code> file to dynamically include the list of NGINX servers using the <code>template</code> module.">

According to the [Ansible special variables documentation][ansible-groups-special-var], there is a `groups` variable that is a dictionary containing all the groups from the inventory. \
There are some examples on how to use it in the [Ansible facts and variables documentation][ansible-groups-example] such as:
```jinja2
{% for host in groups['app_servers'] %}
   # something that applies to all app servers.
{% endfor %}
```

From this example, we can understand that the first line allows us to iterate through groups and, in this case, all the hosts that are in the `app_servers` group. The `host` variable corresponds to one machine from this group.

In the configuration template that we have modified, the declaration of servers looks like `server app[0-9] {hostname}:{port} check`. \
Our goal is to replace the `app[0-9]` with the index of the server, the `{hostname}` with the hostname or IP address of the NGINX server, and the `{port}` with the port NGINX server is using (spoiler: it is port `80`).

In the [`for` documentation of Jinja2][jinja-for-documentation], we can see that there is a `loop` object available when using a `for` loop. 
To replace the `[0-9]` part in `app[0-9]` with the position of the current host in the Ansible inventory, we are using the `index` method from this `loop` object.
Then we replace the `{hostname}` with `{{ nginxServer }}`, which refers to the current host in the loop. Here it corresponds to NGINX server hostname.



```haproxy.cfg
#---------------------------------------------------------------------
# Example configuration for a possible web application.  See the
# full configuration options online.
#
#   https://www.haproxy.org/download/1.8/doc/configuration.txt
#
#---------------------------------------------------------------------

#---------------------------------------------------------------------
# Global settings
#---------------------------------------------------------------------
global
    # to have these messages end up in /var/log/haproxy.log you will
    # need to:
    #
    # 1) configure syslog to accept network log events.  This is done
    #    by adding the '-r' option to the SYSLOGD_OPTIONS in
    #    /etc/sysconfig/syslog
    #
    # 2) configure local2 events to go to the /var/log/haproxy.log
    #   file. A line like the following can be added to
    #   /etc/sysconfig/syslog
    #
    #    local2.*                       /var/log/haproxy.log
    #
    log         127.0.0.1 local2

    chroot      /var/lib/haproxy
    pidfile     /var/run/haproxy.pid
    maxconn     4000
    user        haproxy
    group       haproxy
    daemon

    # turn on stats unix socket
    stats socket /var/lib/haproxy/stats

    # utilize system-wide crypto-policies
    ssl-default-bind-ciphers PROFILE=SYSTEM
    ssl-default-server-ciphers PROFILE=SYSTEM

#---------------------------------------------------------------------
# common defaults that all the 'listen' and 'backend' sections will
# use if not designated in their block
#---------------------------------------------------------------------
defaults
    mode                    http
    log                     global
    option                  httplog
    option                  dontlognull
    option http-server-close
    option forwardfor       except 127.0.0.0/8
    option                  redispatch
    retries                 3
    timeout http-request    10s
    timeout queue           1m
    timeout connect         10s
    timeout client          1m
    timeout server          1m
    timeout http-keep-alive 10s
    timeout check           10s
    maxconn                 3000

#---------------------------------------------------------------------
# main frontend which proxys to the backends
#---------------------------------------------------------------------
frontend main 
    bind                        *:{{ haproxy_port }}
    default_backend             app

#---------------------------------------------------------------------
# round robin balancing between the various backends
#---------------------------------------------------------------------
backend app
    balance     roundrobin
    {% for nginxServer in groups.web  %}
    server  app{{ loop.index }} {{ nginxServer }}:80 check
    {% endfor %}
```

</question-container>


### Global playbook

With playbooks available for both HAProxy and NGINX, we can now construct a straightforward playbook to execute them. \
To address the next question, consult the [import_playbook module documentation][import_playbook-doc].

!> **It is crucial to highlight that for HAProxy to launch successfully, NGINX servers must be up and running.** \
HAProxy appears to ping the servers specified in its configuration at the given port. If they don't respond, the startup fails.

<question-container question="Create a <code>lamp.yml</code> playbook that will run both NGINX and HAProxy playbooks.">

As mentioned, this playbook is quite straightforward. 
All we're doing is importing the two playbooks created earlier. \ 
By doing this, the tasks within **these playbooks will be executed in the order of import**: first the tasks from `nginx.yml` and then those from `haproxy.yml`. \
In this way, **we ensure that the NGINX servers are operational before we try to start HAProxy**.

```yml
- import_playbook: nginx.yml
- import_playbook: haproxy.yml
```

</question-container>


[ansible-inventory]: https://docs.ansible.com/ansible/latest/inventory_guide/intro_inventory.html
[docker-ps]: https://docs.docker.com/engine/reference/commandline/docker/
[ansible-cfg]: https://docs.ansible.com/ansible/latest/reference_appendices/config.html
[question-2]: project-1/part-2?id=question-2
[ansible-modules]: https://docs.ansible.com/ansible/latest/collections/index_module.html
[nginx-beginners-guide]: https://nginx.org/en/docs/beginners_guide.html
[template-module-guide]: https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_templating.html
[template-module]: https://docs.ansible.com/ansible/latest/collections/ansible/builtin/template_module.html
[nginx-ubuntu-html]: https://ubuntu.com/tutorials/install-and-configure-nginx
[creating-the-dockerfiles]: project-1/part-1?id=creating-the-dockerfiles
[service-module]: https://docs.ansible.com/ansible/latest/collections/ansible/builtin/service_module.html
[ansible-variables]: https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_variables.html
[ansible-facts]: https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_vars_facts.html
[ansible-special-variables]: https://docs.ansible.com/ansible/latest/reference_appendices/special_variables.html
[jinja-template-documentation]: https://jinja.palletsprojects.com/en/latest/templates/
[haproxy-config-documentation]: https://www.haproxy.com/documentation/haproxy-configuration-tutorials/core-concepts/ 
<!-- https://docs.haproxy.org/2.4/configuration.html -->
[ansible-groups-special-var]: https://docs.ansible.com/ansible/latest/reference_appendices/special_variables.html#term-groups
[ansible-groups-example]: https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_vars_facts.html#information-about-ansible-magic-variables
[jinja-for-documentation]: https://jinja.palletsprojects.com/en/latest/templates/#for
[import_playbook-doc]: https://docs.ansible.com/ansible/latest/collections/ansible/builtin/import_playbook_module.html