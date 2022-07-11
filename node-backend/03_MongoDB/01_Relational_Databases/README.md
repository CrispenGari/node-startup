### Relational Collection

In mongodb there are collections that relate to each other. In normal SQL we call them relational tables. Let's say we have two collections `Authors` and `Books`. Assuming that an author can write many books and one book can be written by a single author, this takes us to a stage where we want to link the books collection and the author collection. Let's consider the following illustration.

```
        [Book] [Book] ... [Book] [Book]
          |______|__________|_______|
                     |
                  [Author]
```

We can see that this is a one to many relationship, one author to many books. How can we just create one single collection that achieve this relationship in mongoDB.

- We can achieve this by creating a nested collection knowing that our parent collection must be author. We create two schemas author and book schema. Then the author schema will have array of books schema that we can reference if we want. Let's collections has following attributes of keys in them.

```
Book
    - name
    - num_pages
Author
    - name
    - books (array)
```

Let's create a mongodb database that will be able to store this information of authors and books.

The Book and Authors Schema will look as follows:

```js
const BookSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  pages: {
    type: Number,
    required: true,
  },
});
const AuthorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  books: [BookSchema],
});
```

- The full code can be found in the `models/index.js` file.
- The rest will be express and mongoDB and code will be found in the `./server.js`.
- We are going to use Postman to perform CRUD operations.

### Posting a book.

We have created a route in the `server.js` that looks as follows:

```js
app.post("/author", (req, res) => {
  const data = req.body;
  const author = new Author(data);
  author.save();
  res.status(201).send(author);
});
```

**Posting**

- When posting the document should look as follows:

```json
{
  "name": "Crispen",
  "books": [
    {
      "name": "Introduction to AI.",
      "pages": 543
    },
    {
      "name": "Introduction to ML.",
      "pages": 540
    },
    {
      "name": "Introduction to Robotics.",
      "pages": 200
    }
  ]
}
```

### Getting the author by id:

The route for this is:

```js
app.get("/author/:id", (req, res) => {
  const { id } = req.params;
  Author.findById(id, (err, doc) => {
    if (error) {
      throw error;
    }
    if (!doc) {
      return res.status(404).send("Author not found.");
    }
    return res.status(200).send(doc);
  });
});
```

### Getting all authors route.

```js
app.get("/authors", (req, res) => {
  Author.find({}, (error, doc) => {
    if (error) {
      throw error;
    }
    if (!doc) {
      return res.status(404).send("No authors found.");
    }
    return res.status(200).send(doc);
  });
});
```

### Deleting an author route.

```js
app.delete("/author/:id", (req, res) => {
  Author.findByIdAndDelete(id, (error, doc) => {
    if (error) {
      return error;
    } else {
      res.status(204).send(doc);
    }
  });
});
```

### Updating an author route

```js
app.patch("/author/:id", (req, res) => {
  const { id } = req.params;
  Author.findById(id, (error, res_doc) => {
    if (!res_doc) {
      return res.status(304).send("Not Modified");
    } else {
      const data = req.body;
      const new_values = {
        $set: {
          name: data.name,
          books: data.books,
        },
      };
      Author.findByIdAndUpdate(id, new_values, (error, doc) => {
        if (error) {
          throw error;
        }
        res.status(200).send(doc);
      });
    }
  });
});
```

- For the code open the project files
