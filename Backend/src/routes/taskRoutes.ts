import { Router } from 'express';
import {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  getWeeklyStats,
  patchTaskStatus,
  updateTask,
} from '../controllers/taskController.js';
import { validateBody, validateQuery } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/auth.js';
import {
  createTaskSchema,
  patchStatusSchema,
  queryTaskSchema,
  updateTaskSchema,
} from '../validations/taskValidation.js';

const router = Router();

// Apply mandatory authentication to all task routes: only authenticated users can access or manage tasks
router.use(authenticate);

// Stats route (must be defined before /:id)
router.get('/stats/weekly', getWeeklyStats);

// Main tasks collection routes
router.get('/', validateQuery(queryTaskSchema), getTasks);
router.post('/', validateBody(createTaskSchema), createTask);

// Individual task item routes
router.get('/:id', getTaskById);
router.put('/:id', validateBody(updateTaskSchema), updateTask);
router.patch('/:id/status', validateBody(patchStatusSchema.partial()), patchTaskStatus);
router.delete('/:id', deleteTask);

export default router;
