# Step 1 – Objectives

The primary goal of this project is to establish an infrastructure where Ansible will orchestrate the deployment of a load balancer (HAProxy) along with five NGINX web servers. This infrastructure will serve as a robust web hosting environment. <br><br>

- **Load balancer – `HAProxy`**: The load balancer will act as the user interface, directing incoming web requests to the available NGINX servers. It will play a crucial role in ensuring the even distribution of incoming traffic.

- **Web servers – `NGINX`**: There will be five NGINX web servers, **each configured identically**. These servers will host a standard `index.html` file with a unique server identifier. This server ID will allow us to identify and verify which specific server the load balancer has directed the user to. They will not be directly accessible to the user, as the network will not be accessible.

In this infrastructure, the load balancer acts as a **central point of contact** for users and ensures that the incoming web requests are efficiently distributed among the NGINX servers. \
Importantly, these **NGINX servers will not be directly accessible for the user**, as the network will be isolated. They will operate solely to serve web content and respond to requests via the load balancer, effectively **creating a private and secure web hosting environment**.

This project will provide valuable insights into the setup and management of a load-balanced web hosting environment using Ansible.

Visual aids or images can be particularly helpful in further understanding this infrastructure.

<br>

<p align="center"><strong><ins>Infrastructure created with <code>docker compose</code></ins></strong></p>
<img src="https://elambert-guillau.me/devops-training/_assets/media/ansible-training-pt1.svg" alt="Infrastructure created with docker compose" title="Infrastructure created with docker compose" style="width:100%;"/>

<br>

<p align="center"><strong><ins>Deploying applications using <code>Ansible</code></ins></strong></p>
<img src="https://elambert-guillau.me/devops-training/_assets/media/ansible-training-pt2.svg" alt="Application deployement using Ansible"  title="Application deployement using Ansible" style="width:100%;"/>

<br>

<p align="center"><strong><ins>Use of infrastructure</ins></strong></p>
<img src="https://elambert-guillau.me/devops-training/_assets/media/ansible-training-pt3.svg" alt="Use of infrastructure" title="Use of infrastructure" style="width:100%;"/>