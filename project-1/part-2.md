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

| Group |       Servers       |
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


<br>


### Ansible configuration

The main Ansible configuration is within [the `ansible.cfg` file][ansible-cfg]. \
Refering to the [official documentation][ansible-cfg] you can either create a file from scratch or generate a template file using the command:
```bash
$ ansible-config init --disabled > ansible.cfg
```

In our case, Ansible is not installed on the PC; it resides within the `master` container.
While you can generate the configuration file form the container and retrieve its content to copy/paste on your PC, extensive Ansible configuration is unnecessary for our project.

Two specific configurations need attention in our project:
1. Disable SSH key exchange:</ins>
   - In this initial hands-on experience with Ansible, security standards are not our primary concern.
   - Docker Compose is used to deploy servers, and containers have a short lifespan, making it impractical to implement strict SSH key exchange settings.
2. <ins>Specify the user to use when connecting using SSH:</ins> \
   Since the same image is used for all containers, and the `root` user is specified in its `server.Dockerfile`, uniformity is maintained across all containers. This enables us to establish a universal SSH user for Ansible.


<question-container question="Use the official documentation to configure the <code>ansible.cfg</code> file.">

As explained above, there are two parameters to configure:

|     Paramater     | Description                                                                               |
| :---------------: | :---------------------------------------------------------------------------------------- |
| host_key_checking | Enables host key checking by the underlying tools Ansible uses to connect to the targets. |
|    remote_user    | Sets the login user for the target machines.                                              |

<br>

The resulting content for the `./master/config/ansible.cfg` file :
```ini
[defaults]
host_key_checking = false
remote_user = root
```

</question-container>


<br>

## Creatings the playbooks


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
After some Googling and some research in the file system, it apperas that using `apt` in Ubuntu (the base of our container image), the configuration folder is `/etc/nginx/`.

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
1. `Hello! You are connected to ansible-web-1.`
2. `Hello! You are connected to ansible-web-2.`
3. `Hello! You are connected to ansible-web-3.`
4. `Hello! You are connected to ansible-web-4.`
5. `Hello! You are connected to ansible-web-5.`

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

<br>

The NGINX playbook is now complete. \
To test it, follow these steps:
1. **<ins>Run the playbook:</ins>** Run the command `docker compose exec master ansible-playbook nginx.yml`. If you encounter errors, consider adding the following options at the end of the command for debugging: `-vvv --diff`.
2. **<ins>Check NGINX status:</ins>** Use the command `docker compose exec web service nginx status` to confirm that NGINX is running.



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