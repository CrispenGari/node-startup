# from the base image(you can specify the version of the image)
FROM node

# creating a folder app (this folder will be created inside a container)
RUN mkdir -p /home/app

# copying files and folders of our app in the (app) directory
COPY . /home/app
# the entry point command (the reason we did not use the RUN command is that we can have multiple run with only one CMD [entry point command])
CMD [ "node", "/home/app/dist/server.js" ]


