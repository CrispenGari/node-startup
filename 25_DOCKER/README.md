### Docker

In this sub-repository we are going to have a look on running our applications in containers. We are going to have a closer overview on `Docker`.

<img src="https://github.com/CrispenGari/node-backend/tree/main/25_DOCKER/docker_architecture.svg" alt="" width="100%">

### What is Docker?

Docker is a container management service. The whole idea of running code in containers it allows developers to develop applications and ship them into container for easy deployment.

### Installation of Docker

In this section of the Readme we are going to take a look on installing docker. Note that the installation guidelines for different operating system are available. You also have to make sure you meet the requirements on your computer before installing docker on your machine. In this section I'm going to guide through the installation of docker on windows.

I'm going to follow the docker installation guideline from the official docker [website](https://docs.docker.com/desktop/windows/install/).

### Starting Docker

After installation Docker does not start automatically, we need to start it manually.

### Testing if Docker is working.

After installing docker you can open a command prompt and check the version of docker by running the following command:

```shell
docker -v
```

To test if `docker` is working we are going to run the `hello-world` image by running the following command:

```shell
docker run image
```

> _**image** - is the name of the image that is used to run a container. Example of these images are `redis`, `postgres`, `mysql` etc._

To run our hello world program we are going to run the following command:

```shell
docker run hello-world
```

Note that the `run` command, does download the image if not present and run the `hello-world` container.

### Docker Hub

Docker Hub is a registry service on the cloud that allows you to download Docker images that are built by other communities. You can also upload your own Docker built images to Docker hub. You can visit the [docker hub](https://hub.docker.com/) and start exploring docker images. On this platform you can be able to search the image that you want and `pull` them using the docker `pull` command. Let's say we want to pull the redis image from the docker-hub repository we will run the following command:

```shell
docker pull redis
```

Note that the above command will alway pull the latest version of redis image. To `pull` a specific version of `redis` we need to specify the version for example to pull the redis version `6.0` we will run the following command:

```shell
docker pull redis:6.0
```

The cool thing about docker we can run both the these two redis containers because they have different versions.

### Checking which containers are running.

To check the containers that are running you run the following command:

```shell
docker ps
```

### Checking the containers that was recently running?

To check the docker containers that were recently running we use the following command:

```shell
docker ps -a
```

### Images

An image is a combination of file system and parameters. Let's take a look at the following docker command:

```shell
docker run redis
```

In our case `redis` is a docker image which will then be called a container.

### Listing docker images.

The `images` command in docker lists all the images that are installed. For example we can list all images by running the following docker command:

```shell
docker images
```

> output:

```shell
REPOSITORY   TAG       IMAGE ID       CREATED      SIZE
postgres     latest    5b21e2e86aab   8 days ago   376MB
redis        7.0       53aa81e8adfa   8 days ago   117MB
redis        latest    53aa81e8adfa   8 days ago   117MB
```

If you would want to return the images id only one will run the following docker `images` command with the `q` flag as follows:

```shell
docker images -q
```

### Removing docker images.

To remove docker images we run the following command:

```shell
docker rmi <image_id>
```

> Note that the `image_id` is the id for the image. for example if we would want to remove postgres image we will run the following command:

```shell
docker rmi 5b21e2e86aab
```

### Inspecting the image or container

In docker the `inspect` command is used to inspect the image or a container.

```shell
docker inspect <repository_name>
```

Example:

```shell
docker inspect <redis>
```

### Containers

Containers are instance of docker images that can be run using the docker command `run`.

To list running container we run the following command:

```shell
docker ps
```

To list all the containers in the system we pass the `a` flag to the docker `ps` command as follows:

```shell
docker ps -a
```

### Docker history

With this command, you can see all the commands that were run with an image via a container.

```shell
docker history <image_id>
```

Example:

```shell
docker history 53aa81e8adfa
```

### Basic Docker Command

In this section we are going to look at some of the essential basic docker commands that can be used in software development. These commands can be found [here](https://docs.docker.com/engine/reference/commandline/docker/).

1. search

This command is used to search the information about an image in docker hub.

```shell
docker search mysql
```

2. pull

This command is used to pull the image from docker hub to our system.

```shell
docker pull mysql
```

> We can specify the version of `mysql` image for example if we want to download mysql version `7.0` we will run the following command:

```shell
docker run mysql:7.0
```

3. images

This command is used to list all the images that are in the system.

```shell
docker images
```

4. run

This is used to start a container. If the container is not found on the system then docker will download it from docker hub and start the container.

```shell
docker run mysql
```

> Again with the `run` command we can specify the version of the image because by default docker will download the latest. `docker run mysql:7.2`

5. ps

This command is used to list all running containers

```shell
docker ps
```

> In the `ps` command we can pass the flag `a` or `all` to list all the containers in the system.

6. stop

The stop command is used to stop the container from running either by container id or container name.

```shell
docker stop 7878003b56ab
```

7. restart

We can restart the stopped container by running the following command:

```shell
docker restart 7878003b56ab
```

> You may want to use this command let's say if your computer reboot. 8. rename

We can rename our container so that we can easily track it by running the `rename` command as follows:

```shell
docker rename redis myredis
```

9. exec

Access the running container test_db by running the following command. It’s helpful if we want to access the MySQL command line and execute MySQL queries.

```shell
docker exec -it test_db bash
mysql -uroot -pmy-secret-pw
SHOW DATABASES;
```

10. logs

This command is helpful to debug our Docker containers. It will fetch logs from a specified container.

```shell
docker logs 7878003b56ab
```

11. rm

This command is used to remove a container for example if we want to remove the redis container we will do the following.

```shell
docker rm 7878003b56ab
```

12. rmi

This command is used to remove the images in docker for example if we want to remove the redis docker image we will run the following command.

```shell
docker rmi redis
```

### Refs

1. [www.docker.com](https://www.docker.com/get-started/)
2. [www.tutorialspoint.com](https://www.tutorialspoint.com/docker/)
3. [docs.docker.com - commands](https://docs.docker.com/engine/reference/commandline/docker/)
4. [towardsdatascience.com](https://towardsdatascience.com/12-essential-docker-commands-you-should-know-c2d5a7751bb5)
