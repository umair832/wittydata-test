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

/** TASK Data */
//Get all task data
router.get('/api/task', async (ctx) => {
  const client = await pool.connect();
  const { rows } = await client.query('SELECT * FROM task');
  ctx.body = rows;
});

//Create new task data
router.post('/api/task/:id', async (ctx) => {
  const client = await pool.connect();
  const { id } = ctx.params;
  const { title, description } = ctx.request.body;

  const queryText = 'INSERT INTO task (title, description, user_id) VALUES ($1, $2, $3)';
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

//Update existing task data
router.put('/api/task/:id', async (ctx) => {
  const client = await pool.connect();
  const { id } = ctx.params;
  const { title, description } = ctx.request.body;

  const queryText = 'UPDATE task SET title = $1, description = $2 WHERE id = $3';
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

//Delete existing task data
router.delete('/api/task/:id', async (ctx) => {
  const client = await pool.connect();
  const { id } = ctx.params;

  const queryText = 'DELETE FROM task WHERE id = $1';
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


/**ASSIGNMENT Data */
//Create new assignment data
router.post('/api/assignment', async (ctx) => {
  const client = await pool.connect();
  const { userID, taskID } = ctx.request.body;

  const queryText = 'INSERT INTO assignmet (user_id, task_id) VALUES ($1, $2)';
  const values = [userID, taskID];

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

//Update existing assignment data
router.put('/api/assignment/:id', async (ctx) => {
  const client = await pool.connect();
  const { id } = ctx.params;
  const { userID, taskID } = ctx.request.body;

  const queryText = 'UPDATE assignment SET user_id = $1, task_id = $2 WHERE id = $3';
  const values = [userID, taskID, id];

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

//Get current assignments for user
router.get('/api/assignment/:id', async (ctx) => {
  const client = await pool.connect();
  const { id } = ctx.params;

  const { rows } = await client.query('SELECT * FROM task JOIN assignment ON $1 = user_id', [id]);
  ctx.body = rows;
});


app.use(router.routes()).use(router.allowedMethods());

app.listen(port, () => console.log('Server listening on port', port));
