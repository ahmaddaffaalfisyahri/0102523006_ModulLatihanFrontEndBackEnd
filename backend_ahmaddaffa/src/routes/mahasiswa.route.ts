import { Router } from 'express';
import { getMahasiswa, createMahasiswa, updateMahasiswa, deleteMahasiswa } from '../controllers/mahasiswa.controller';
import { upload } from '../middlewares/upload.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authMiddleware, getMahasiswa);
router.post('/', authMiddleware, upload.single('foto'), createMahasiswa);
router.put('/:id', authMiddleware, upload.single('foto'), updateMahasiswa);
router.delete('/:id', authMiddleware, deleteMahasiswa);

export default router;

