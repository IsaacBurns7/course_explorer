This repository was made for Aggies by Aggies!
Aggies need great education, and great education starts with great professors, and great courses.

The aim of this project is to make course registration, specifically with respect to finding great professors, easier and simpler. 
Rate my professor already exists to this end, but this tool aims to automate discovery of all professors for a given course, as an
alternative to manually searching every professor for every class.
Additionally, we scrape RMP for course-specific data - i.e. not how good is the professor at teaching generally, but how
good are they at teaching the specific class the user is requesting.
The above has already been done.

To extend this, we aim to automatically build optimal schedules for the user. The user should be allowed
to decide what "optimal" means for them. This means how much emphasis they place on rating vs GPA, but also
how much they care about each class, and whether they want breaks, classes to be near each other, 
classes to end by 6pm, or start no earlier than 10am.
Additionally, we plan to extend this by creating a RAG Pipeline, where we perform sentiment analysis 
on data obtained via API or scraped from various other sites like reddit, coursicle, etc. 
We could also extend this by allowing users to post their own comments on the specific professor and course. 

Any and all issues or bugs can be submitted in the issues section of the github repository. 

All current developments (TODOs) will be held a google doc. Contributers will be given access.


The below information is technical, and aims to provide the user with a high-level overview of the architecture of the project. 
More detailed technical information will be available within the "docs" subdirectory. 

# Three tier architecture

The project is roughly based on a 3 tier architecture. 
The database layer was originally MongoDB, but has since become an PostgreSQL, to combat increasing complexity. 
The backend layer is Express.
The frontend layer is React with tailwind, bundeled by webpack. 

# Infrastructure

## Process Management

Currently, the frontend is served as two files - the main.js file compiled by webpack, and the index.html file. 
Both are served by NGINX over https. 

The backend runs as a node process, managed by pm2. This will later be changed to a docker container to combat
scaling requirements.

The database currently runs as a local PostgreSQL docker container.

## Deployment

Currently, the frontend, backend, and database layers are all deployed on one instance, because I am poor. 
This is not ideal, and soon we will deploy 2 instances for security and scalability. 
The first instance will hold the frontend, and will not be very large or secure. 
The second instance will hold both the backend and database layers, and it will need to be more secure and more powerful.
Alternatively, we could run the database layer on Neon, if greater scaling requirements appear. 

This 2-instance deployment scheme may be copied for an active-passive or active-active failover scheme. 
The secondary will be an old desktop with two VMs running on it. 
I want to attribute thanks to Andrew Huang(github username: mezwer), for providing it to me, 
and Oscar Lay(github username: sudocanttype), for helping me set this up. 

# Running this project
You will need node to run this project. 
Download node: https://nodejs.org/en/download
You will need to run "npm install" in the frontend and backend folders.

Below section is only if u wish to run the project locally.
PLEASE NOTE that you do not have to run the database locally, as a connection to NeonDB will work just fine.
Contact Isaac or Rafay for a connection string. 

You will need postgresql and docker to run the database locally, 
or a connection to the neon database instance. 
Postgresql: https://www.postgresql.org/download/
docker: https://docs.docker.com/engine/install/
If you do not have brew, postgresql and docker have instructions on their respective websites. 

To run postgresql container locally, pull the postgresql docker container
docker pull postgres
and run it
docker run -d --name mypostgres -p 5432:5432 -e POSTGRES_PASSWORD=yourpassword postgres

Note that running a docker container before creating a local database through psql will not work.
Instructions for that can be found on the web. I suggest the official postgres documentation, it is very helpful!