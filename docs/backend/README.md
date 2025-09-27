The backend layer is a simple express app. Given this, the reader will fit into one of 3 buckets.

Bucket 1: Has worked with express before.
For those in bucket 2, skip to the next section.

Bucket 2: Has worked with a backend framework before, like Spring, .NET, Flask, or Django, but has not worked with Express.
For those in bucket 2, express serves REST HTTP Endpoints. 
Each resource is grouped into a file under /routes, with accompanying /controllers for controller logic.
server.js is the entry point. 
If you need more information, express documentation, while not great, will suffice.

Bucket 3: Has not worked with any backend framework or project before. 
For those in Bucket 3, forgive me, this part may be a little bit of yap. I hope you can learn through the yap though.
A "backend" is essentially a second process that handles both sensitive and complex processing. 
If the frontend is the tip of the iceberg, the backend is the proverbial rest of the iceberg.

In the case of this project, all you need to know is that the frontend requires data, which will denote A, to display to users.
That data may be is often a subset of a larger piece of data, which will we denote B.
A must be obtained from B, and we have two options to obtain it.
Option 1: Send it from storage to the user, and process it on the frontend. 
Option 2: Process it on the backend, and send it to the user. 
Option 1 is not ideal for 2 reasons. 
1. Security: Often B contains sensitive data. In this case, A might be sensitive, but the rest of B also might be. 
You would not want to send over Alice's medical history to Bob when Bob requests his. 
2. Network Bandwidth: Often B is much larger than A. Sending over B, rather than A, will slow down the application
as often the majority of latency is network bandwidth, especially for users with slower connections. 

Given this, every large application does the vast majority of its processing on the backend. 
As a standard to communicate between the backend and the frontend, REST was developed.
It stands for Representational State Transfer. The following are its rough standards.
1. It is stateless, and the same call(parameters, body, bearer token) should always return the same result.
2. Cacheability - Responses from the server can be explicitly or implicitly labeled as cacheable or non-cacheable. 
We do not use this part of REST much, since React already caches pages by default. 
3. Uniform Interface - APIs are organized as resources rather than actions. This means instead of calling
localhost:4000/planner/getClasses, you would call localhost:4000/planner/classes with method "GET". 
4. Layered System - the backend can be composed of multiple layers of proxies, load balancers, gateways, etc
without affecting client-server interaction.

Further reading on REST is suggested, but not required. The below section is for all 3 buckets.

# Backend Architecture
## server.js(entry point)
This serves as the entry point of the project, and connects to the routes and controllers.
It handles high-level routing as well. 
Example: localhost:4000/api/planner/pdf. It will read /api/planner, and hand off this request to routes/planner.js

## routes
This is where the routing logic is handled. Effectively, it is a wire that connects a request to its accompanying controller. 
Example: localhost:4000/api/planner/pdf will be handed to the planner router, located at routes/planner.js. 
Then, the planner router will pass this off to the correct function in controllers/planner.js. 
It is also capable of ensuring requests have the proper parameters to allow for a logically correct query. 
Example
localhost:4000/api/search/graphData?department=CSCE&courseNumber=120 will pass through the router.
localhost:4000/api/search/graphData?courseNumber=120 will not through the router, as it is missing a department.

## controllers
This is where the complex data processing happens. 
It is mostly written in SQL, and in production has a pgPool connection to the docker container on the instance.
Alternatively, a connection can be made with a neondb connection string, which will be the case in development.

## test 
This is currently for unit tests to ensure application is working as expected. 

## services
This is mostly for getting data from public APIs, or scraping data from websites. 
This data is then placed into the database. 

## models
This folder was for connection to MongoDB Atlas, and enforced a schema on collections. Given the ongoing migration
to postgresql, this will become effectively useless, and will be carefully fazed out once the migration is complete.