The database is where we will store all our information. It was previously built on MongoDB, and served using MongoDB Atlas.
We have since begun a migration to PostgreSQL to simplify and speed up queries. 
Currently, we still need to migrate over the services that insert into MongoDB, and the planner routes.

## Structure

The database currently consists of serveral folders.
1. Administration: This is where the db settings, schemas, and privileges are configured, as well as any required administration.
2. Examples: This is simple examples you can reference
3. Migration_tools: This was to migrate our MongoDB Database over to PostgreSQL.
4. Models: This is to set up accompanying tables, as well as their Data Models(Schema).

Currently, it is relatively simple, and most of the complexity is in the backend controllers that run SQL Read Queries. 
This could change in the future, if we decide to restructure the controllers to insert SQL Files. 

## Deployment

The database will be deployed on the same instance as the backend, on both AWS, and on an old PC. 
The secondary database on the old PC will be a backup.
We will also have production and development databases hosted on Neon. 
The production database will serve as a final backup, and the development database will allow 
developers to potentially destroy it, without causing too much damage.

## Usage

Please contact Isaac or Rafay for development connection strings, as well as setup to the NeonDB. 
If you want to learn SQL, I suggest official PostgreSQL documentation. It is quite good. 


