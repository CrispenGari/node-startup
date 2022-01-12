import { client } from "../src/db";
import request from "supertest";

import { app } from "../src/server";

beforeAll(async () => {
  await client.query(
    "CREATE TABLE IF NOT EXISTS movies (uid SERIAL NOT NULL, title TEXT NOT NULL UNIQUE, decription TEXT NOT NULL, PRIMARY KEY(uid))"
  );
});

beforeEach(async () => {
  // seed with some data
  await client.query(
    "INSERT INTO movies (title, decription) VALUES ('Title 1', 'Description 1'), ('Title 2', 'Description 2')"
  );
});

afterEach(async () => {
  await client.query("DELETE FROM movies");
});

// --------------- Test cases

describe("GET / with 404 status ", () => {
  test("This test if for world card routes of the API.", async () => {
    const response = await request(app.callback()).get("/");
    expect(response.statusCode).toBe(404);
  });
});

describe("POST /api/movies/new ", () => {
  test("This test creating a movie.", async () => {
    const response = await request(app.callback())
      .post("/api/movies/new")
      .send({
        title: "testing title " + Math.random().toString().slice(2),
        decription: "description",
      });
    expect(response.body).toHaveProperty("uid");
    expect(response.body).toHaveProperty("title");
    expect(response.body).toHaveProperty("decription");
    expect(response.statusCode).toBe(201);
  });
});

describe("DELETE /api/movies/delete/:uid ", () => {
  test("This test deleting a movie.", async () => {
    // Create a new movie
    const response = await request(app.callback())
      .post("/api/movies/new")
      .send({
        title: "testing title " + Math.random().toString().slice(2),
        decription: "description",
      });

    expect(response.body).toHaveProperty("uid");
    expect(response.body).toHaveProperty("title");
    expect(response.body).toHaveProperty("decription");
    // Delete the created movie
    const res = await request(app.callback()).delete(
      "/api/movies/delete/" + response.body.uid
    );
    expect(res.body).toBeTruthy();
    expect(res.statusCode).toBe(200);
  });
});

describe("GET /api/movies/all ", () => {
  test("This test is for getting all the movies from the API.", async () => {
    const response = await request(app.callback()).get("/api/movies/all");
    expect(response.statusCode).toBe(200);
  });
});

describe("GET /api/movies/one/:uid ", () => {
  test("Getting a single movie from an API.", async () => {
    //    Creating a movie
    const response = await request(app.callback())
      .post("/api/movies/new")
      .send({
        title: "testing title " + Math.random().toString().slice(2),
        decription: "description",
      });
    expect(response.body).toHaveProperty("uid");
    expect(response.body).toHaveProperty("title");
    expect(response.body).toHaveProperty("decription");
    // Getting the created movie
    const res = await request(app.callback()).get(
      "/api/movies/one/" + response.body.uid
    );
    expect(res.body).toBeTruthy();
    expect(res.body).toHaveProperty("uid");
    expect(res.body).toHaveProperty("title");
    expect(res.body).toHaveProperty("decription");
    expect(res.statusCode).toBe(200);
  });
});

describe("PUT /api/movies/update/:uid ", () => {
  test("Updating a single movie from an API.", async () => {
    //    Creating a movie
    const response = await request(app.callback())
      .post("/api/movies/new")
      .send({
        title: "testing title " + Math.random().toString().slice(2),
        decription: "description",
      });
    expect(response.body).toHaveProperty("uid");
    expect(response.body).toHaveProperty("title");
    expect(response.body).toHaveProperty("decription");

    // Update the created movie
    const res = await request(app.callback())
      .put("/api/movies/update/" + response.body.uid)
      .send({
        title: "testing updated " + Math.random().toString().slice(2),
        decription: "description updated",
      });

    expect(res.body).toBeTruthy();
    expect(res.body.decription).toContain("updated");
    expect(res.body).toHaveProperty("uid");
    expect(res.body).toHaveProperty("title");
    expect(res.body).toHaveProperty("decription");
    expect(res.statusCode).toBe(200);
  });
});

afterAll(async () => {
  await client.query("DROP TABLE movies");
  await client.end();
});
