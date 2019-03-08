const express = require('express');

/* todo importa frá todos.js */
const {
  create,
  readAll,
  readOne,
  update,
  del,
} = require('./todos');

const router = express.Router();

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

/**
 * Middleware that handles GET requests to './'
 * @param {object} req Request object
 * @param {object} res Response object
 * @returns {Object} returns array containing JSON objects for todos
 */
async function todosRoute(req, res) {
  const { order, completed } = req.query;

  const todos = await readAll(order, completed);

  return res.status(200).json(todos.rows);
}

/**
 * Middleware that handles creating a new todo via POST requests to './'
 * @param {object} req Request object
 * @param {object} res Response object
 * @returns {Object} returns a single JSON object for a single todo
 */
async function createRoute(req, res) {
  const { title, position, completed, due } = req.body;

  const result = await create({ title, position, completed, due });

  if (!result.success) {
    return res.status(400).json(result.validation);
  }

  return res.status(201).json(result.item);
}

/**
 * Middleware that handles get requests to './:id'
 * @param {object} req Request object
 * @param {object} res Response object
 * @returns {Object} returns a single JSON object for a single todo
 */
async function todoRoute(req, res) {
  const { id } = req.params;

  const todo = await readOne(id);

  if (todo) {
    return res.json(todo);
  }

  return res.status(404).json({ error: 'Verkefni er ekki til' });
}

/**
 * Middleware that handles updating data via PATCH requests to './:id'
 * @param {object} req Request object
 * @param {object} res Response object
 * @returns {Object} returns a single JSON object for a single todo
 */
async function patchRoute(req, res) {
  const { id } = req.params;
  const { title, position, completed, due } = req.body;

  const result = await update(id, { title, position, completed, due });

  if (!result.success && result.validation.length > 0) {
    return res.status(400).json(result.validation);
  }

  if (!result.success && result.notFound) {
    return res.status(404).json({ error: 'Verkefni er ekki til' });
  }

  return res.status(201).json(result.item);
}

/**
 * Middleware that handles delete requests to './:id'
 * @param {object} req Request object
 * @param {object} res Response object
 * @returns {Object} returns 204 (no content) message if no error
 */
async function deleteRoute(req, res) {
  const { id } = req.params;

  const result = await del(id);

  if (result) {
    return res.status(204).json({});
  }

  return res.status(404).json({ error: 'Verkefni er ekki til' });
}

router.get('/', catchErrors(todosRoute));
router.post('/', catchErrors(createRoute));
router.get('/:id', catchErrors(todoRoute));
router.patch('/:id', catchErrors(patchRoute));
router.delete('/:id', catchErrors(deleteRoute));

module.exports = router;
