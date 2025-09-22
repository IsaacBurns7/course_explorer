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
As a standard to communicate between the backend and the frontend 

This is the backend's job. 
It is the ox plowing the land. The engines that do this data processing are found in the controllers folder.