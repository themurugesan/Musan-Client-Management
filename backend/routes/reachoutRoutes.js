import express from 'express';
import { getReachouts, createReachout, updateReachout, deleteReachout } from '../controllers/reachoutController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getReachouts);
router.post('/', createReachout);
router.put('/:id', updateReachout);
router.delete('/:id', deleteReachout);

export default router;