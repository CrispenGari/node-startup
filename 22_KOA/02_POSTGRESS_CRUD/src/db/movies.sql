-- Creating a Table movies

CREATE TABLE IF NOT EXISTS movies(
    uid SERIAL NOT NULL,
    title VARCHAR(30) NOT NULL UNIQUE,
    decription VARCHAR(30) NOT NULL,
    PRIMARY KEY(uid)
);