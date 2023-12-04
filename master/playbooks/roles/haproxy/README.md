HAProxy Role
=========

Install and start a basic HAProxy server.

Role Variables
--------------

|      Location       |   Variable   | Value |                            Description                            |
| :-----------------: | :----------: | :---: | :---------------------------------------------------------------: |
| `defaults/main.yml` | haproxy_port | `80`  | The port used by HAProxy to load balance the user to the servers. |

Example Playbook
----------------

```yml
- hosts: dev_lb
  roles:
    - haproxy
```