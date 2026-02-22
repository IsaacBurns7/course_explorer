# Foreword
Take issues 1-5 as suggested implementation points, please understand before implementing, if they seem wrong then 
you are a human, so you can override the AI slave. 

## Issue 1 finds many issues with no typescript on the frontend, but the most pressing ones are
- zod validation on API response handling
- complex state transformations in custom hooks

## Issue 2 finds many issues with no typescript on the backend, but the most pressing ones are
- zod validation on API request handling
- zod validation on DB response handling
- complex state transformations in handlers
### secondary issues 
- complex state transformations in services
- zod validation on API response handling (in services)

Issue 3 is a restate of issues 1 and 2

Issue 4 and 5 are both infra-level setups and expected ins and outs.

## Expected Behavior 
Backend has three folders, dist, src, and test
- a few scripts to help hot-reload development, and testing, and building, and running in prod
- Issues 1 and 2 are resolved as explained above

