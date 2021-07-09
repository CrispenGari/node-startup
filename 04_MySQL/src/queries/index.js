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
