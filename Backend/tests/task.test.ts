import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { getTodayString, getWeekStart } from '../src/utils/dateUtils.js';

describe('Task API Endpoints', () => {
  const today = getTodayString();
  const currentWeekStart = getWeekStart(today);

  const sampleTask = {
    title: 'Finishing Wireframe',
    description: 'High fidelity mobile Figma wireframes',
    date: today,
    startTime: '09:00 AM',
    endTime: '10:30 AM',
    priority: 'High',
    status: 'pending',
  };

  describe('POST /api/tasks', () => {
    it('should create a new task with valid data and auto-compute weekStart', async () => {
      const res = await request(app).post('/api/tasks').send(sampleTask);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.title).toBe(sampleTask.title);
      expect(res.body.data.weekStart).toBe(currentWeekStart);
      expect(res.body.data.status).toBe('pending');
    });

    it('should fail with 400 if title is missing or empty', async () => {
      const res = await request(app).post('/api/tasks').send({
        ...sampleTask,
        title: '',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Validation failed');
    });

    it('should fail with 400 if date format is invalid', async () => {
      const res = await request(app).post('/api/tasks').send({
        ...sampleTask,
        date: 'invalid-date',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail with 400 if startTime or endTime is missing', async () => {
      const res = await request(app).post('/api/tasks').send({
        title: 'Meeting',
        date: today,
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/tasks', () => {
    it('should retrieve list of tasks', async () => {
      await request(app).post('/api/tasks').send(sampleTask);
      await request(app).post('/api/tasks').send({
        ...sampleTask,
        title: 'Meeting with team',
        startTime: '11:00 AM',
        endTime: '12:00 PM',
      });

      const res = await request(app).get('/api/tasks');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data.length).toBe(2);
    });

    it('should filter tasks by date', async () => {
      await request(app).post('/api/tasks').send(sampleTask);
      await request(app).post('/api/tasks').send({
        ...sampleTask,
        title: 'Future Task',
        date: '2026-12-25',
      });

      const res = await request(app).get(`/api/tasks?date=${today}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].title).toBe('Finishing Wireframe');
    });

    it('should filter tasks by keyword search', async () => {
      await request(app).post('/api/tasks').send(sampleTask);
      await request(app).post('/api/tasks').send({
        ...sampleTask,
        title: 'Buy a cat food',
        description: 'Purina gourmet salmon',
      });

      // Search by title substring
      const res1 = await request(app).get('/api/tasks?search=wireframe');
      expect(res1.status).toBe(200);
      expect(res1.body.data.length).toBe(1);
      expect(res1.body.data[0].title).toBe('Finishing Wireframe');

      // Search by description substring
      const res2 = await request(app).get('/api/tasks?search=salmon');
      expect(res2.status).toBe(200);
      expect(res2.body.data.length).toBe(1);
      expect(res2.body.data[0].title).toBe('Buy a cat food');
    });
  });

  describe('GET /api/tasks/stats/weekly', () => {
    it('should calculate weekly open vs completed metrics correctly', async () => {
      // 2 pending tasks, 1 completed task
      await request(app).post('/api/tasks').send({ ...sampleTask, status: 'pending' });
      await request(app).post('/api/tasks').send({
        ...sampleTask,
        title: 'Task 2',
        status: 'pending',
      });
      await request(app).post('/api/tasks').send({
        ...sampleTask,
        title: 'Task 3',
        status: 'completed',
      });

      const res = await request(app).get(`/api/tasks/stats/weekly?date=${today}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.weekStart).toBe(currentWeekStart);
      expect(res.body.data.open).toBe(2);
      expect(res.body.data.completed).toBe(1);
      expect(res.body.data.total).toBe(3);
      // 1 / 3 = 33%
      expect(res.body.data.progressPercentage).toBe(33);
    });

    it('should return 0% progress when no tasks exist for the week', async () => {
      const res = await request(app).get(`/api/tasks/stats/weekly?date=2028-01-01`);

      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(0);
      expect(res.body.data.open).toBe(0);
      expect(res.body.data.completed).toBe(0);
      expect(res.body.data.progressPercentage).toBe(0);
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should retrieve task by ID', async () => {
      const created = await request(app).post('/api/tasks').send(sampleTask);
      const taskId = created.body.data._id;

      const res = await request(app).get(`/api/tasks/${taskId}`);

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(taskId);
      expect(res.body.data.title).toBe(sampleTask.title);
    });

    it('should return 404 if task ID does not exist', async () => {
      const nonExistentId = '654321654321654321654321';
      const res = await request(app).get(`/api/tasks/${nonExistentId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await request(app).get('/api/tasks/invalid-id-format');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update task attributes and recalculate weekStart if date changes', async () => {
      const created = await request(app).post('/api/tasks').send(sampleTask);
      const taskId = created.body.data._id;

      const res = await request(app).put(`/api/tasks/${taskId}`).send({
        title: 'Updated Title',
        priority: 'Low',
        date: '2026-11-20',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Updated Title');
      expect(res.body.data.priority).toBe('Low');
      expect(res.body.data.weekStart).toBe(getWeekStart('2026-11-20'));
    });
  });

  describe('PATCH /api/tasks/:id/status', () => {
    it('should toggle task status between pending and completed', async () => {
      const created = await request(app).post('/api/tasks').send(sampleTask);
      const taskId = created.body.data._id;
      expect(created.body.data.status).toBe('pending');

      // Toggle to completed
      const res1 = await request(app).patch(`/api/tasks/${taskId}/status`);
      expect(res1.status).toBe(200);
      expect(res1.body.data.status).toBe('completed');

      // Toggle back to pending
      const res2 = await request(app).patch(`/api/tasks/${taskId}/status`);
      expect(res2.status).toBe(200);
      expect(res2.body.data.status).toBe('pending');
    });

    it('should assign explicit status when provided', async () => {
      const created = await request(app).post('/api/tasks').send(sampleTask);
      const taskId = created.body.data._id;

      const res = await request(app).patch(`/api/tasks/${taskId}/status`).send({ status: 'completed' });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('completed');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete task and remove it from database', async () => {
      const created = await request(app).post('/api/tasks').send(sampleTask);
      const taskId = created.body.data._id;

      const deleteRes = await request(app).delete(`/api/tasks/${taskId}`);
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);

      const getRes = await request(app).get(`/api/tasks/${taskId}`);
      expect(getRes.status).toBe(404);
    });
  });
});

