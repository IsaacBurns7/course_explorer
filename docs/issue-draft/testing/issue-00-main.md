# Foreword
Take issues 1-5 as suggested implementation points, please understand before implementing, if they seem wrong then 
you are a human, so you can override the AI slave. 
Testing external synchronization ("get data from this API" or "receive data from this API") IS NOT 
part of a unit test!!! It is part of an integration test. 

## Issue 1 clarifications
Most backend handlers (in the controllers folder) are structured as
- Get data from DB
- Perform some computation on data
You should only test the second part

There are many other backend functions that do not follow this pattern, and they are generally
supporting functions that encapsulate some piece of computation. These should also be tested with defined
ins and outs. They are effectively a handler without a "get data from DB" part. 

## Issue 2 clarifications 

As stated before, many non-component functions in the frontend are simply "perform computation", while others
are "get data from API -> perform computation". You will see a lot of this in the custom hooks. 
If you see a hook that both calls an API and performs a computation on it, you should break it apart into these 
two components, and then test only the computation part for the unit test. 

I'm not really too sure on how frontend unit tests for components should look like.

## Issue 3 clarifications

Look at the existing tests in the backend/test folder. These tests are integration tests, since they test
that the endpoint can talk to the database, and performs the correct computations. 
You should follow this pattern for all existing endpoints. 
Beyond that, you can cook up what other integration tests would be necessary, but that's up to you. 

## Issue 4 clarifications
yeah we're not doing this yet... 