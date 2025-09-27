The frontend is the interface between the user, and the backend resources / services.
As such, it is usually lighter than the backend. 
In our case, since the project is not extremely complex yet, the frontend is more hefty. 
This trend will probably not continue for much longer though.

## Structure

The frontend consists of the following folders, as well config files for webpack, tailwind, etc: 
1. Public - this holds index.html and main.js. Main.js is the JS webpack bundles, which we send to clients via nginx
2. Src - this holds the rest of the code

Within src, there are several important files and folders.
1. index.js - this is the entry point, and it loads App
2. App.js - This is the brain of the project. Primarily, it routes to different pages based on auth, and url. 
3. Styles - this is where globally accessible css files are found. This project is built on tailwind, 
so you mostly wont need this.
4. Pages - These are the component that loads when you navigate between different pages on the client side.
5. Components - This is the bulk of the code, and contains reusable components. A general rule of thumb though is to make
sure that your components are no longer than 300 lines, preferably between 100 and 200. If it goes past this,
you should probably break that component up into sub components. This will make for far more maintainable code.
6. Context - This is essentially a collection of global variables, which a component can subscribe to. Please note though,
that if you have context with parts A, B, and C, part B changing will rerender a component that only uses part A.
That is, a component that consumes part A of context X does not subscribe to part A, it subscribes to context X.
I suspect this will cause some issues in the future, and we may have to implement redux to circumvent this - it allows
subscription to part A.
7. Hooks - These are essentially special utility functions that have the ability to pry into React's internals.
These are usually used to encapsulate a common usecase of useEffect, and allow it to be reused. 
8. Assets - these are just images and svgs we render.

## Usage

If you do not know react yet, I would highly recommend reading the React Docs. 
They are very helpful, and have many times saved me when I encountered a particularly nasty bug. 
Additionally, please be very careful when using useEffect especially, and make sure to have most, if not all UseEffects within the top-level pages components,
to avoid sending out O(n) API calls. You can pass down the data using props, or context.