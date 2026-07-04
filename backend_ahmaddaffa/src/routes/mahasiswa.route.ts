import { Router } from 'express';
import { getMahasiswa, createMahasiswa, updateMahasiswa, deleteMahasiswa } from '../controllers/mahasiswa.controller';
import { upload } from '../middlewares/upload.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { allowRoles } from '../middlewares/role.middleware';

const router = Router();

router.get('/', authMiddleware, allowRoles('admin', 'operator', 'viewer'), getMahasiswa);
router.post('/', authMiddleware, allowRoles('admin', 'operator'), upload.single('foto'), createMahasiswa);
router.put('/:id', authMiddleware, allowRoles('admin', 'operator'), upload.single('foto'), updateMahasiswa);
router.delete('/:id', authMiddleware, allowRoles('admin'), deleteMahasiswa);

export default router;

