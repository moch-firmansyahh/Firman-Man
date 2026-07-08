import { Router } from 'express';
import * as todoController from '../controllers/todo.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createTodoSchema, updateTodoStatusSchema } from '../validators/todo.validator';

const router = Router();

// Apply auth middleware to all todo routes
router.use(authenticate);

router.get('/', todoController.list);
router.get('/summary', todoController.summary);
router.post('/', validate(createTodoSchema), todoController.create);
router.put('/:id', validate(createTodoSchema), todoController.update);
router.patch('/:id/status', validate(updateTodoStatusSchema), todoController.updateStatus);
router.delete('/:id', todoController.remove);

export default router;
