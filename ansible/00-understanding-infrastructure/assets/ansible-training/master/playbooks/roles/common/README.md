Common Role
=========

Role used as the basis for all other roles.

Role Variables
--------------

|       Location        |      Variable      |   Value   | Description                                                     |
| :-------------------: | :----------------: | :-------: | :-------------------------------------------------------------- |
| `./defaults/main.yml` | `ansible_ssh_user` |  `root`   | The user Ansible must use when connecting to hosts via SSH.     |
| `./defaults/main.yml` | `ansible_ssh_pass` | `ansible` | The password Ansible must use when connecting to hosts via SSH. |