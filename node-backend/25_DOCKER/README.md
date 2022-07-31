### Docker

In this sub-repository we are going to have a look on running our applications in containers. We are going to have a closer overview on `Docker`.

<img src="https://github.com/CrispenGari/node-backend/blob/main/25_DOCKER/docker_architecture.svg" alt="" width="100%">

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

With the `run` command we can be able to pass in options which can be found [here](https://docs.docker.com/engine/reference/commandline/run/) for example the `-d` or `detach` flag or option is passed and allows a container to run in the background and returns a container id.

```shell
docker run -d redis
# or
docker run -detach redis
```

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

### How can I restart a container?

To restart a container you need a container id for example `7878003b56ab` and run the following commands.

```shell
docker stop 7878003b56ab
# then
docker start 7878003b56ab
```

### Having a problem in starting docker after your computer restarts?

If docker keeps on saying `starting` after you restarts your computer you will probably want to run the following 2 commands:

```shell
wsl --unregister docker-desktop
wsl --unregister docker-desktop-data
```

> **Note:** _It should be noted that this removes all docker containers and data. (WLS: Unregisters the distribution and deletes the root filesystem.)_

After doing that you can start docker again.

### Port Binding

Let's say we have two redis images that are of different version. If i start these two containers and run the following command:

```shell
docker ps
```

The following will be the output:

```shell
CONTAINER ID   IMAGE       COMMAND                  CREATED          STATUS         PORTS      NAMES
a517c94a3df1   redis:6.2   "docker-entrypoint.s…"   10 seconds ago   Up 6 seconds   6379/tcp   youthful_sutherland
1acb4eaceeb5   redis       "docker-entrypoint.s…"   4 minutes ago    Up 4 minutes   6379/tcp   zealous_kalam
```

These two containers are running on the same port `6379/tcp` we need to use port binding to enable these containers to run on our custom port. To do that we use the `-p` option to bind our container with custom port to the default port which is `6379`

```shell
docker run -p<Custom Port>:<Container Port>
# example
docker run -d -p3002:6379 redis
docker run -d -p3003:6379 redis:6.2
```

> **Note:** _Before binding the ports we need to stop our containers first. Also note that you can map a container to multiple ports by specifying another `-p` flag. for example:_

```shell
docker run -d -p 3001:6379 -p3002:6379 redis
```

Now if we run the command:

```shell
docker ps
```

The output will be as follows:

```shell
CONTAINER ID   IMAGE       COMMAND                  CREATED          STATUS          PORTS                    NAMES
c63317a97cb9   redis:6.2   "docker-entrypoint.s…"   18 seconds ago   Up 14 seconds   0.0.0.0:3003->6379/tcp   romantic_buck
e066896a0464   redis       "docker-entrypoint.s…"   26 seconds ago   Up 21 seconds   0.0.0.0:3002->6379/tcp   hopeful_meitner

```

### Debugging containers.

In this section we are going to have a look at how we can debug our containers. We are going to look at some various docker commands for debugging containers

1. logs

This command fetchs the logs for the container example:

```shell
docker logs <container id>
# example
docker logs e066896a0464
```

Alternatively you can pass the container name instead of a container id.

> Note that with docker you can give a container a name in the `run` command by running the following command.:

```shell
docker run -d -p:3001:6379 --name redis-new redis
```

Now you can view the `logs` by running the following command:

```shell
docker logs redis-new
```

2. exec

This command is used to run a new command in a running container.

```shell
docker exec -it <container_id|container_name> /bin/bash

# example
docker exec -it redis-new /bin/bash
```

### Removing Containers

To remove containers in docker we run the following command:

```shell
docker rm <container_id>
```

Let's say we want to remove all the containers that we have run before, we can run the following command:

```shell
docker rm $(docker ps -aq)
```

Where the `docker ps -aq` returns a list of all container ids.

If i run:

```shell
docker ps -aq
```

You will get the output that is similar to this:

```
999f483b6e75
384033af38f8
e6bff9a896a4
4d73646ff998
681ac517563a
4d5852b2c65f
37b981085162
1a3a0d11d562
e29780d541b4
8e38a6e2570e
ff7feecf21d5
19ad68bef537
c63317a97cb9
e066896a0464
a517c94a3df1
8dcba97d0dde
1acb4eaceeb5
```

### Volumes

Volumes allows us to persist data that is being used by docker containers. It also allows us to share data between the host and the container.

### Creating a Volume

To create a volume we run the following command:

```shell
docker volume create <volume_name>
# example
docker volume create my-vol
```

### Checking Volumes

To check the volumes that are available we run the following commad:

```shell
docker volume ls
```

### Deleting a Volume

To delete a volume we run the following command

```shell
docker volume rm  <volume_name>
```

### Starting a container with a Volume

There are two ways of starting a container with a volume, using the `--mount` or the `-v`. I'm going to practically show how we can start an `nginx` with these different ways.

```shell
docker run -d --name web --mount source=my-vol,target=/app nginx
```

If you run `docker inspect web` under the mount section we will be able to see the following:

```json
{
  "Mounts": [
    {
      "Type": "volume",
      "Name": "my-vol",
      "Source": "/var/lib/docker/volumes/my-vol/_data",
      "Destination": "/app",
      "Driver": "local",
      "Mode": "z",
      "RW": true,
      "Propagation": ""
    }
  ]
}
```

We can do the same with the `-v`

```shell
docker run -d --name web -v my-vol:/app nginx:latest
```

You can specify volumes in the docker compose file as follows:

```yml
version: "3.9"
services:
  frontend:
    image: node:lts
    volumes:
      - myapp:/home/node/app
volumes:
  myapp:
```

You can create a `readonly` volume by specifying `ro` when starting a container for example:

```shell
docker run -d --name=nginxtest -v nginx-vol:/usr/share/nginx/html:ro nginx:latest
```

If we start the `nginx` server as follows:

```shell
docker run -d -p 3000:80 --name=nginxtest -v nginx-vol:/usr/share/nginx/html:ro nginx:latest
```

And we go to `localhost:3000` we will see a basic nginx welcome page. We want to override that by the use of volumes. So we are going to create a new folder and create an `index.html` file in that folder. We will then open the command prompt in that folder and run the following command:

```shell
docker run --name website -v $(pwd):/usr/share/nginx/html:ro -d -p 3001:80 nginx
# Or using absolute path for the host
docker run --name website -v C:\Users\crisp\OneDrive\Desktop\nginx:/usr/share/nginx/html:ro -d -p 3001:80 nginx
```

Now if we open `localhost:3001` we will be able to see the contents in our `index.html` file that is on the host at `C:\Users\crisp\OneDrive\Desktop\nginx`. Let's see what is happening in the container using the `exec` command:

```shell
docker exec -it website bash
```

We can check the contents of our html by running the following commands

```shell
root@73577575aa4d:/# cd /usr/share/nginx
root@73577575aa4d:/usr/share/nginx# cd html
root@73577575aa4d:/usr/share/nginx/html# cat index.html
<h1>Hello there!!</h1>root@73577575aa4d:/usr/share/nginx/html#
```

Now let's try to create a new file called about.html in the container so that it will reflect on the file system of the host. First we need to make sure that our volume is not `read-only`. So let's restart our `website` container and remove the readonly property so that we can be able to create a file from the container to the host.

```shell
docker run --name website -v C:\Users\crisp\OneDrive\Desktop\nginx:/usr/share/nginx/html -d -p 3001:80 nginx
```

Now in the container we will create a file called `about.html` as follows

```shell
docker exec -it website bash

# Then
root@46b7c7b9d48e:/# cd /usr/share/nginx/html
root@46b7c7b9d48e:/usr/share/nginx/html# touch about.html
root@46b7c7b9d48e:/usr/share/nginx/html# ls
about.html  index.html
root@46b7c7b9d48e:/usr/share/nginx/html#
```

So the `about.html` file will be reflated on our file system at `C:\Users\crisp\OneDrive\Desktop\nginx`

### Refs

1. [www.docker.com](https://www.docker.com/get-started/)
2. [www.tutorialspoint.com](https://www.tutorialspoint.com/docker/)
3. [docs.docker.com - commands](https://docs.docker.com/engine/reference/commandline/docker/)
4. [towardsdatascience.com](https://towardsdatascience.com/12-essential-docker-commands-you-should-know-c2d5a7751bb5)
