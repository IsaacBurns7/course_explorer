To create local db install postgres then do

psql postgres - connect to postgres database (the default)
CREATE DATABASE mydb;

exit psql - should be \q 

psql -d mydb - connect to new database you just made
\i dump.sql - to restore database