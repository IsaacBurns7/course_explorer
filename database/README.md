To generate a local database

Install postgresql - below is a sample way to do it using brew, use whatever installer you wish (or official postgresql website)

brew install postgresql
brew services start postgresql

the command below will log you into the local postgres database
psql postgres

the command below will restore the database with no 
\i local_dump_no_roles.sql 

congratulations you have now made the local database and can now connect to it <:
