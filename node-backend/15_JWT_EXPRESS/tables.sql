-- refreshTokens

CREATE TABLE jwt(
    id SERIAL NOT NULL PRIMARY KEY,
    token TEXT NOT NULL
)

-- students table
CREATE TABLE students(
    id SERIAL NOT NULL PRIMARY KEY,
    username VARCHAR(15) NOT NULL UNIQUE,
    password VARCHAR(15) NOT NULL,
    email VARCHAR(25) NOT NULL
)