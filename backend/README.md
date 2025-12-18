To run backend

npm install
node server.js

you will need local db or neon db
for neon db - look at backend general 

for local db(recommended)
look at database/README.md to create local db

CREATE .env file

EXAMPLE

PORT=4000 
DB_USERNAME=isaac - whatever your user is called. find by running \du in psql
DB_PASSWORD=<redacted> - should be blank
NEON_DB_URL=<redacted> - for neon db
