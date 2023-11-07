# Requirements

Here I will list the required tools and/or knowledge needed for the following projects.


## Docker engine

The first thing to have is Docker engine, which includes docker compose. \
As we will be using just one machine, Docker compose will help us emulate a multi-machine configuration. \
Docker installation varies according to your operating system, so please consult [the official installation documentation][docker-install].

!> While reading the official documentation, you'll probably be tempted to install the `Docker Desktop` application. \
I recommend you don't install it, as it launches a VM in the background to run Docker (at least on Windows). \
If you are on Windows, like me, consider using WSL2 with the help of the following documentation: [Install Docker in WSL 2 without Docker Desktop][wsl-docker].

Of course, it is best if you know how to use Docker or, even better, Docker compose. \
If you have never used Docker, I recommend you read the following documentation before starting:
- [Getting Started with Docker (beginners to advanced)][docker-doc1]
- [Working with Docker Images – Explained with Examples][docker-doc2]
- [Docker (french course)][docker-doc3]





[docker-install]: https://docs.docker.com/engine/install/
[wsl-docker]: https://nickjanetakis.com/blog/install-docker-in-wsl-2-without-docker-desktop
[docker-doc1]: https://dockerlabs.collabnix.com/
[docker-doc2]: https://www.learnitguide.net/2018/06/working-with-docker-images-explained.html
[docker-doc3]: https://supports.uptime-formation.fr/04-docker/