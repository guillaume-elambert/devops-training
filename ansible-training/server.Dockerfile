FROM geerlingguy/docker-ubuntu2204-ansible

# Uninstall Ansible via Pip.
RUN pip3 uninstall -y $pip_packages

RUN apt-get update
RUN apt-get install -y openssh-server vim net-tools telnet
RUN ln -s /usr/bin/python3 /usr/bin/python

RUN echo 'root:ansible' | chpasswd
RUN sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config
RUN sed -i 's/PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config
RUN sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config


# SSH login fix. Otherwise user is kicked off after login
RUN sed 's@session\s*required\s*pam_loginuid.so@session optional pam_loginuid.so@g' -i /etc/pam.d/sshd

ENV NOTVISIBLE "in users profile"
RUN echo "export VISIBLE=now" >> /etc/profile

RUN mkdir -p /run/sshd
RUN mkdir ~/.ssh && chmod 700 ~/.ssh

CMD ["service", "ssh", "restart", "-D"]