# Personal-Money-Manager
This is my personal Money Manager that is a part of my personal projects .
This s built on Python

Steps to build the Rest of the Project : 

BEFORE TOUCHING THE PROJECT — Learn Python Basics (1 week)
You need this foundation first. Don't skip it.

Variables, data types, strings, numbers
Lists, dictionaries (these are everywhere in backend)
Functions, loops, if/else
Importing packages
Reading/writing files, using .env

Resource: python.org/about/gettingstarted or free CS50P on edX (Harvard's Python course — completely free, beginner friendly)

WEEK 2 — Understand How APIs Work (before writing any code)
Since you've used Laravel, you already know this concept. Just map it:

Laravel Route → FastAPI route
Laravel Controller → FastAPI function
Eloquent Model → SQLAlchemy Model
php artisan migrate → alembic upgrade head
.env file → same, exact same concept
Postman for testing → same tool, nothing changes

Spend 1 day just reading what a REST API is, what JSON is, and how HTTP verbs (GET, POST, PUT, DELETE) work. You likely already know this from Laravel.

WEEK 2-3 — Learn FastAPI (your main framework)
FastAPI is beginner friendly. Learn only these things in order:

Creating a basic route that returns JSON
Accepting data from the user (request body)
Validating that data with Pydantic
Returning proper responses and error messages
Connecting to a database

Resource: FastAPI official docs fastapi.tiangolo.com — read the Tutorial section only, not Advanced.

WEEK 3-4 — Learn Databases with Python

Learn basic SQL first — SELECT, INSERT, UPDATE, DELETE. Use sqliteonline.com to practice, no setup needed.
Then learn SQLAlchemy — this is just Python code that generates that SQL for you, exactly like Eloquent.
Learn Alembic — only 3 commands matter: init, revision, upgrade

Resource: SQLAlchemy docs + any YouTube tutorial for "SQLAlchemy FastAPI beginners"

WEEK 4-5 — Build the WealthFlow Backend
Now you have enough knowledge. Build in this exact order, one endpoint at a time:

Connect your database, create the User table, run migration
Build Register endpoint — accept name, email, password, save to DB
Build Login endpoint — check password, return a JWT token
Build Transactions endpoints — GET all, POST new (protected, needs token)
Build Dashboard summary endpoint — total balance, income, expenses
Build Category spending endpoint — for the donut chart

Don't build everything at once. One endpoint, test it in Postman, then move on.

WEEK 6 — Connect Your Frontend

Replace the fake data in app.js with real fetch() calls to your API
Build a simple Login page in HTML
Save the JWT token in localStorage after login
Send that token with every API request


WEEK 7 — Put It Online

Push your code to GitHub
Deploy backend free on Railway.app — takes 30 minutes, no server knowledge needed
Deploy frontend free on Vercel — drag and drop
Use Supabase for your database — free managed PostgreSQL, no setup


The Honest Truth About Timeline
If you give it 3-4 hours daily, this entire roadmap is 6-8 weeks. Don't rush weeks 1-3. A weak foundation means you'll get stuck and frustrated on week 5. The project will only take 2 weeks once your basics are solid.
You already have the UI done which most beginners spend weeks on. You're genuinely ahead. Just be patient with the learning phase and come back here whenever you get stuck on anything specific.