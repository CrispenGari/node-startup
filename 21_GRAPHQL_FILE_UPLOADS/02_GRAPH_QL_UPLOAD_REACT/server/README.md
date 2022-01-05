### Server

Server is just an implementation from [this repository](https://github.com/CrispenGari/node-backend/tree/main/21_GRAPHQL_FILE_UPLOADS/01_BASIC_UPLOAD_TYPE_GRAPHQL) you can Read the Readme file of that repository.

> Note that the only difference is that if you upload a file, then the graphql server will return a file to the `url` rather than a true or false value. So the response will be looking as follows:

```json
{
  "data": {
    "uploadFile": "http://localhost:3001/images/_programmers.life_20200716_8.png"
  }
}
```
