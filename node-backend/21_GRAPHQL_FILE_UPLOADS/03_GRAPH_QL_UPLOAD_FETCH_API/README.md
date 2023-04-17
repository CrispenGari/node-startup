### File Uploads Graphql using Fetch API

In this one we are going to learn how we can do file apploads using the `FormData` api and the javascript `fetch` API without using a graphql client like `urql`, `relay` etc. We already have a sever that is working and to implement the server read the readme of [this repository.](https://github.com/CrispenGari/node-startup/tree/main/node-backend/21_GRAPHQL_FILE_UPLOADS/01_BASIC_UPLOAD_TYPE_GRAPHQL)

Next we are going to start the server by running the following command:

```shell
yarn start
```

After the `graphql` server has started we are going to create a folder called client which is the folder were we are going to create our `html` simple client for uploading files. So the `html` will look as follows:

```html
<body>
  <input type="file" id="picture" />
  <button id="button">Upload File</button>
</body>
```

We need to listen to the `onchange` event of our `input` and grab the file. So in our `js` we are going to add the following:

```js
let file = null;

document.getElementById("picture").addEventListener("change", (e) => {
  file = e.target.files[0];
});
```

Now we want to say when the button is clicked we want to upload the file, so in our `js` to listen to the click even and then:

1. create a new `FormData` object
2. append the key `operations` with the actual query that is going to upload the file:

```js
{"query":"mutation UploadFile($picture: Upload!){  uploadFile(picture: $picture)}"}
```

3. append the `map` key to the `fromData` which looks as follows

```shell
{"0":["variables.picture"]}
```

4. We will then append the `0` ke with the actual file that we want to upload.

5. Then we will need to use a `fetch` API with the formData and request method as post to our `http://localhost:3001/graphql`. Now when you click the button the file will be uploaded on the server.

```js
document.getElementById("button").addEventListener("click", async () => {
  const formData = new FormData();
  const map = `{"0":["variables.picture"]}`;
  const operations = `{"query":"mutation UploadFile($picture: Upload!){  uploadFile(picture: $picture)}"}`;
  formData.append("operations", operations);
  formData.append("map", map);
  formData.append("0", file);
  console.log({ file });

  const res = await fetch("http://localhost:3001/graphql", {
    body: formData,
    method: "post",
  });
  const data = res.json();
  console.log({ data });
});
```

The whole javascript code looks as follows:

```js
let file = null;

document.getElementById("picture").addEventListener("change", (e) => {
  file = e.target.files[0];
});

document.getElementById("button").addEventListener("click", async () => {
  const formData = new FormData();
  const map = `{"0":["variables.picture"]}`;
  const operations = `{"query":"mutation UploadFile($picture: Upload!){  uploadFile(picture: $picture)}"}`;
  formData.append("operations", operations);
  formData.append("map", map);
  formData.append("0", file);
  console.log({ file });

  const res = await fetch("http://localhost:3001/graphql", {
    body: formData,
    method: "post",
  });
  const data = res.json();
  console.log({ data });
});
```

### Refs

1. [floriangaechter](https://www.floriangaechter.com/posts/graphql-file-uploading/)
2. [CrispenGari](https://github.com/CrispenGari/node-startup/tree/main/node-backend/21_GRAPHQL_FILE_UPLOADS/01_BASIC_UPLOAD_TYPE_GRAPHQL)
