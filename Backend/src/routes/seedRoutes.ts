import { Router } from 'express';
import { seedInvigilatorData } from '../controllers/seedController.js';

const router = Router();

// Allow both POST and GET for invigilator convenience (e.g. visiting /api/seed in browser or calling via curl)
router.post('/', seedInvigilatorData);
router.get('/', seedInvigilatorData);

export default router;

