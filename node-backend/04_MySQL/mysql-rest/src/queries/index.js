export const CREATE_DATABASE_IF_NOT_EXIST_QUERY = (db_name) => {
  return `CREATE DATABASE IF NOT EXISTS ${db_name};`;
};

export const SELECT_DATABASE = (db_name) => {
  return `USE ${db_name};`;
};
export const CREATE_TABLE_IF_NOT_EXISTS = (table_name) => {
  return `CREATE TABLE IF NOT EXISTS ${table_name}(
        id INT(10) NOT NULL AUTO_INCREMENT,
        stud_name VARCHAR(25) NOT NULL,
        stud_surname VARCHAR(25) NOT NULL,
        email VARCHAR(25) NOT NULL,
        age INT(2) NOT NULL,
        PRIMARY KEY(id)
    );
    `;
};

export const ADD_STUDENT = (data) => {
  const { stud_name, stud_surname, email, age } = data;
  return `
    INSERT INTO students(stud_name, stud_surname, email, age) VALUES('${stud_name}', '${stud_surname}', '${email}', ${age});
    `;
};

export const GET_ALL_STUDENTS = () => {
  return `SELECT * FROM students;`;
};

export const GET_STUDENT_BY_ID = (id) => {
  return `SELECT * FROM students WHERE id LIKE ${id} LIMIT 1;`;
};

export const DELETE_BY_ID = (id) => {
  return `DELETE FROM students WHERE id = ${id};`;
};

export const UPDATE_STUDENT = (id, data) => {
  if (data.email && data.age) {
    const { email, age } = data;
    return `UPDATE students SET email='${email}', age=${age} WHERE id=${id};`;
  } else if (data.email && !data.age) {
    const { email } = data;
    return `UPDATE students SET email='${email}' WHERE id=${id};`;
  } else {
    const { age } = data;
    return `UPDATE students SET age=${age} WHERE id=${id};`;
  }
};
