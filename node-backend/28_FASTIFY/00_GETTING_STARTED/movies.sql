-- Creating a Table movies

CREATE TABLE IF NOT EXISTS movies(
    uid SERIAL NOT NULL,
    title TEXT NOT NULL UNIQUE,
    decription TEXT NOT NULL,
    PRIMARY KEY(uid)
);
