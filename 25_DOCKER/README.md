### Docker

In this sub-repository we are going to have a look on running our applications in containers. We are going to have a closer overview on `Docker`.

<img src="https://www.tutorialspoint.com/docker/images/docker-mini-logo.jpg" alt="" width="100%">

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

### Containers

### Images

### Refs

1. [www.docker.com](https://www.docker.com/get-started/)
2. [www.tutorialspoint.com](https://www.tutorialspoint.com/docker/)
