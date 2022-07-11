-- Creating a Table Users

CREATE TABLE IF NOT EXISTS users(
    uid SERIAL NOT NULL,
    username VARCHAR(30) NOT NULL UNIQUE,
    firstName VARCHAR(30) NOT NULL,
    lastName VARCHAR(30) NOT NULL,
    age INT NOT NULL,
    PRIMARY KEY(uid)
);
