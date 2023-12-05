NGINX Role
=========

Install and start a basic NGINX server.

Dependencies
------------

This role depends on the following roles:
- [`common`](../common/README.md)

Example Playbook
----------------

```yml
- hosts: web
  roles:
    - nginx
```