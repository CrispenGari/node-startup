### PostgreSQL and Node.js

- [Docs](https://node-postgres.com/)

### Installation

```
yarn add pg
yarn add -D @types/pg

<!-- OR -->

npm i pg
npm i -D @types/pg
```

### Creating a database using command line.

Open `psql` Shell and enter your credentials. Then:

```
postgres=# create database <db_name>;
```

### Listing databases.

```
postgres=# \l
```

### Selecting a database.

```
postgres=# \c <database_name>;
```

### Listing tables in a selected database

```
postgres=# \dt

<!-- OR -->
postgres=# \dt+
```

### Creating a new user in Postgress

```shell
psql -U postgres -c "CREATE ROLE crispen LOGIN NOSUPERUSER INHERIT CREATEDB CREATEROLE;"
```

### Useful Resorces

- [postgresqltutorial](https://www.postgresqltutorial.com/)
