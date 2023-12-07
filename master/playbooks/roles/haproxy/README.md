HAProxy Role
=========

Install and start a basic HAProxy server.

Role Variables
--------------

|       Location        |    Variable    | Value | Description                                                       |
| :-------------------: | :------------: | :---: | :---------------------------------------------------------------- |
| `./defaults/main.yml` | `haproxy_port` | `80`  | The port used by HAProxy to load balance the user to the servers. |

Dependencies
------------

This role depends on the following roles:
- [`common`](../common/README.md)

Example Playbook
----------------

```yml
- hosts: lb
  roles:
    - haproxy
```