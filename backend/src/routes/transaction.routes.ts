import { Router } from 'express';
import * as transactionController from '../controllers/transaction.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createTransactionSchema } from '../validators/transaction.validator';

const router = Router();

// Apply auth middleware to all transaction routes
router.use(authenticate);

router.get('/', transactionController.list);
router.get('/summary', transactionController.summary);
router.post('/', validate(createTransactionSchema), transactionController.create);
router.put('/:id', validate(createTransactionSchema), transactionController.update);
router.delete('/:id', transactionController.remove);

export default router;
