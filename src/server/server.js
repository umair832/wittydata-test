const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const session = require('koa-session');
const { Pool } = require('pg');
const cors = require('@koa/cors');
const fs = require('fs');
const path = require('path');

const bcrypt = require('bcrypt');

const app = new Koa();
const router = new Router();
const port = 3001;

app.use(cors());
app.use(bodyParser());

// Connect to the PostgreSQL database
const pool = new Pool({
  user: 'postgres',
  password: '123',
  host: 'localhost',
  database: 'witty',
  port: 5432
});

// Middleware to handle session
app.keys = ['paQoyZOwyGBAaah3IjPCbHMpo5hmTHyS'];
app.use(session(app));

/**Authentication */
//Login for User
router.post('/api/login', async (ctx) => {
  const { username, password } = ctx.request.body;
  const client = await pool.connect();

  const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);

  const isMatch = bcrypt.compareSync(password, result.rows[0].password);

  if (isMatch) {
    ctx.session.user = result.rows[0];
    ctx.body = { user: ctx.session.user, success: true };
  } else {
    ctx.body = { success: false };
  }
});


//Logout for User
router.get('/api/logout', (ctx) => {

  delete ctx.session.user;
  ctx.body = { success: true };
});



/** User Data */
//Get all users
router.get('/api/users', async (ctx) => {
  const client = await pool.connect();
  const { rows } = await client.query('SELECT * FROM users');
  ctx.body = rows;
});

//Create new user
router.post('/api/users', async (ctx) => {
  const client = await pool.connect();
  const { username, password } = ctx.request.body;

  // Check if email is already registered
  const { rows } = await client.query('SELECT * FROM users');
  const userExists = rows.find((user) => user.username === username);
  if (userExists) {
    ctx.status = 409;
    ctx.body = { message: 'User already exists' };
    return;
  }

  // Hash password with bcrypt
  const saltRounds = 10;
  const hash = bcrypt.hashSync(password, saltRounds);

  // Create a new user
  const queryText = 'INSERT INTO users (username, password) VALUES ($1, $2)';
  const values = [username, hash];

  try {
    await client.query(queryText, values);
    ctx.body = { success: true };
  } catch (error) {
    console.error(error);
    ctx.status = 500;
    ctx.body = { success: false };
  }
});

/** TODO List Data */
//Get all todo list data
router.get('/api/todos', async (ctx) => {
  const client = await pool.connect();
  const { rows } = await client.query('SELECT * FROM todolist');
  ctx.body = rows;
});

//Create new todo list data
router.post('/api/todos', async (ctx) => {
  const client = await pool.connect();
  const { title, description } = ctx.request.body;

  const queryText = 'INSERT INTO todolist (title, description) VALUES ($1, $2)';
  const values = [title, description];

  try{
    await client.query(queryText, values);
    ctx.body = { success: true };
  }
  catch (error){
    console.error(error);
    ctx.status = 500;
    ctx.body = { success: false };
  }
});

//Update existing todo list data
router.put('/api/todos/:id', async (ctx) => {
  const client = await pool.connect();
  const { id } = ctx.params;
  const { title, description } = ctx.request.body;

  const queryText = 'UPDATE todolist SET title = $1, description = $2 WHERE id = $3';
  const values = [title, description, id];

  try{
    await client.query(queryText, values);
    ctx.body = { success: true };
  }
  catch (error){
    console.error(error);
    ctx.status = 500;
    ctx.body = { success: false };
  }
});

//Delete existing todo list data
router.delete('/api/todos/:id', async (ctx) => {
  const client = await pool.connect();
  const { id } = ctx.params;

  const queryText = 'DELETE FROM todolist WHERE id = $1';
  const values = [id];

  try{
    await client.query(queryText, values);
    ctx.body = { success: true };
  }
  catch (error){
    console.error(error);
    ctx.status = 500;
    ctx.body = { success: false };
  }
});


app.use(router.routes()).use(router.allowedMethods());

app.listen(port, () => console.log('Server listening on port', port));
