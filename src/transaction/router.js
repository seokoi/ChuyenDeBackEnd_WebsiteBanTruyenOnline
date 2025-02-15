import express from 'express';
import { getTransactionHistory, cancelTransaction, updateTransactionStatus } from '../transaction/controller';

const router = express.Router();

router.get('/history', getTransactionHistory);
router.post('/cancel/:transactionId', cancelTransaction);
router.put('/admin/update-status/:transactionId', updateTransactionStatus);

export default router;
