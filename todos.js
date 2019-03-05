const { Client } = require('pg');
const validator = require('validator');
const xss = require('xss');

const connectionString = process.env.DATABASE_URL;

/* hjálparföll */

function isEmpty(s) {
  return s == null && !s;
}

/**
 * Validate a todo.
 *
 * @param {Object} todo - Todo to validate
 * @param {string} todo.title - Title of todo, must be of length [1, 128]
 * @param {int} todo.position - Position of todo
 * @param {boolean} todo.completed - True if todo is completed, else false
 * @param {string} todo.due - Due date of todo, must be a valid ISO 8601 string
 *
 * @returns {array} Array of validation of errors, empty error if no errors
 */
function validateTodo({ title, position, completed, due } = {}) {
  const errors = [];

    if (typeof title !== 'string' || !validator.isLength(title, { min: 1, max: 128 })) {
      errors.push({
        field: 'title',
        message: 'Titill verður að vera strengur sem er 1 til 128 stafir',
      });
    }

  if (!isEmpty(due)) {
    if (typeof due !== 'string' || !validator.isISO8601(due)) {
      errors.push({
        field: 'due',
        message: 'Dagsetning verður að vera gild ISO 8601 dagsetning',
      });
    }
  }

  if (!isEmpty(position)) {
    if (typeof position !== 'number' || position < 0) {
      errors.push({
        field: 'position',
        message: 'Staðsetning verður að vera heiltala stærri eða jöfn 0',
      });
    }
  }

  if (!isEmpty(completed)) {
    if (typeof completed !== 'boolean') {
      errors.push({
        field: 'completed',
        message: 'Lokið verður að vera boolean gildi',
      });
    }
  }

  return errors;
}

/**
 * Execute an SQL query.
 *
 * @param {string} sqlQuery - SQL query to execute
 * @param {array} [values=[]] - Values for parameterized query
 *
 * @returns {Promise} Promise representing the result of the SQL query
 */
async function query(sqlQuery, values = []) {
  const client = new Client({ connectionString });
  await client.connect();

  let result;

  try {
    result = await client.query(sqlQuery, values);
  } catch (err) {
    console.error('Error executing query', err);
    throw err;
  } finally {
    await client.end();
  }

  return result;
}

/* api */

/**
 * Create a todo asynchronously.
 *
 * @param {Object} todo - Todo to create
 * @param {string} todo.title - Title of todo
 * @param {string} todo.position - Position of todo
 * @param {string} todo.completed - Todo completed or not
 * @param {string} todo.due - Due date of todo 
 *
 * @returns {Promise} Promise representing the object result of creating the todo
 */
async function create({ title, position, completed = false, due} = {}) {
  const validation = validateTodo({ title, position, completed, due });

  if (validation.length > 0) {
    return {
      success: false,
      validation,
      item: null,
    };
  }

  const sqlQuery = 'INSERT INTO todos(title, position, completed, due) VALUES($1, $2, $3, $4) RETURNING *';
  const values = [xss(title), xss(position), completed, xss(due)];

  const result = await query(sqlQuery, values);

  return {
    success: true,
    validation: [],
    item: result.rows[0],
  };
}

/**
 * Read all todos.
 *
 * @returns {Promise} Promise representing an array of all todo objects
 */
async function readAll(order = 'ASC', completed = null) {
  const orderString = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  if (completed === 'false' || completed === 'true') {
    return query(`SELECT * FROM todos WHERE completed = $1 ORDER BY position ${orderString}`, [completed]);
  }
  return query(`SELECT * FROM todos ORDER BY position ${orderString}`, []);
}


/**
 * Read a single todo.
 *
 * @param {number} id - Id of todo
 *
 * @returns {Promise} Promise representing the todo object or null if not found
 */
async function readOne(id) {
  const sqlQuery = 'SELECT id, title, due, position, completed, created, updated FROM todos WHERE id = $1';

  const result = await query(sqlQuery, [id]);

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

/**
 * Update a todo asynchronously.
 *
 * @param {number} id - Id of todo to update
 * @param {Object} todo - Todo to create
 * @param {string} todo.title - Title of todo
 * @param {string} todo.due - Due date of todo
 * @param {string} todo.position - Position of todo
 * @param {string} todo.completed - Todo completed or not
 *
 * @returns {Promise} Promise representing the object result of creating the todo
 */
async function update(id, { title, position, completed, due } = {}) {
  const result = await query('SELECT * FROM todos where id = $1', [id]);

  if (result.rows.length === 0) {
    return {
      success: false,
      notFound: true,
      validation: [],
      completed: true,
    };
  }

  const validationResult = await validateTodo({ title, position, completed, due });

  if (validationResult.length > 0) {
    return {
      success: false,
      notFound: false,
      validation: validationResult,
      completed: true,
    };
  }

  const changedColumns = [
    !isEmpty(title) ? 'title' : null,
    !isEmpty(position) ? 'position' : null,
    !isEmpty(due) ? 'due' : null,
    !isEmpty(completed) ? 'completed' : null,
  ].filter(Boolean);

  const changedValues = [
    !isEmpty(title) ? xss(title) : null,
    !isEmpty(position) ? xss(position) : null,
    !isEmpty(due) ? xss(due) : null,
  ].filter(Boolean);

  if (completed || completed === false) {
    changedValues.push(completed);
  }

  const updates = [id, ...changedValues];

  const updatedColumnsQuery =
    changedColumns
      .map((column, i) => `${column} = $${i + 2}`);

  console.log(updates);
  console.log(updatedColumnsQuery);

  const sqlQuery = `
    UPDATE todos
    SET ${updatedColumnsQuery.join(', ')}, updated = current_timestamp
    WHERE id = $1
    RETURNING title, position, completed, due, created, updated`;
  console.log(sqlQuery);

  const updateResult = await query(sqlQuery, updates);
  console.log(updateResult);
  return {
    success: true,
    item: updateResult.rows[0],
  };
}

/**
 * Delete a todo asynchronously.
 *
 * @param {number} id - Id of todo to delete
 *
 * @returns {Promise} Promise representing the boolean result of creating the todo
 */
async function del(id) {
  const sqlQuery = 'DELETE FROM todos WHERE id = $1';

  const result = await query(sqlQuery, [id]);

  return result.rowCount === 1;
}

module.exports = {
  create,
  readAll,
  readOne,
  update,
  del
};