import { Request, Response } from 'express';
import pool from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import fs from 'fs';
import path from 'path';

// Helper to delete photo
const deletePhotoFile = (filename: string | null) => {
  if (filename) {
    const filePath = path.join(__dirname, '../../uploads/mahasiswa', filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error("Gagal menghapus file foto:", err);
      }
    }
  }
};

export const getMahasiswa = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 10, 1);
    const offset = (page - 1) * limit;
    const search = req.query.search ? String(req.query.search) : '';
    const prodiId = req.query.prodi_id ? Number(req.query.prodi_id) : null;

    let countQuery = 'SELECT COUNT(*) as total FROM mahasiswa m WHERE 1=1';
    let dataQuery = `
      SELECT m.id, m.nim, m.nama, m.angkatan, m.foto, p.id AS prodi_id, p.nama_prodi 
      FROM mahasiswa m 
      LEFT JOIN prodi p ON m.prodi_id = p.id 
      WHERE 1=1
    `;
    const queryParams: any[] = [];

    if (search) {
      countQuery += ' AND (m.nim LIKE ? OR m.nama LIKE ?)';
      dataQuery += ' AND (m.nim LIKE ? OR m.nama LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (prodiId) {
      countQuery += ' AND m.prodi_id = ?';
      dataQuery += ' AND m.prodi_id = ?';
      queryParams.push(prodiId);
    }

    // Execute count query
    const [countRows] = await pool.query<RowDataPacket[]>(countQuery, queryParams);
    const total = countRows[0]?.total || 0;

    // Add pagination to data query
    dataQuery += ' ORDER BY m.id DESC LIMIT ? OFFSET ?';
    const dataParams = [...queryParams, limit, offset];

    const [rows] = await pool.query<RowDataPacket[]>(dataQuery, dataParams);

    res.json({
      message: 'Data mahasiswa berhasil diambil',
      meta: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit)
      },
      data: rows
    });
  } catch (error: any) {
    console.error("Get Mahasiswa Error:", error);
    const errorMessage = error?.code === 'ECONNREFUSED' ? 'Koneksi ke database gagal. Pastikan MySQL berjalan.' : (error?.message || 'Terjadi kesalahan');
    res.status(500).json({ message: 'Gagal mengambil data mahasiswa', error: errorMessage });
  }
};
export const getAllMahasiswa = getMahasiswa;

export const createMahasiswa = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nim, nama, prodi_id, angkatan } = req.body;
    const foto = req.file ? req.file.filename : null;

    if (!nim || !nama || !prodi_id || !angkatan) {
      if (foto) deletePhotoFile(foto); // Clean up uploaded file if validation fails
      res.status(400).json({ message: 'Semua field (nim, nama, prodi_id, angkatan) wajib diisi' });
      return;
    }

    const [existing]: any = await pool.query(
      "SELECT id FROM mahasiswa WHERE nim = ?",
      [nim]
    );

    if (existing.length > 0) {
      if (foto) deletePhotoFile(foto);
      res.status(400).json({ message: "NIM sudah digunakan" });
      return;
    }

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO mahasiswa (nim, nama, prodi_id, angkatan, foto) VALUES (?, ?, ?, ?, ?)',
      [nim, nama, Number(prodi_id), Number(angkatan), foto]
    );

    res.status(201).json({
      message: 'Data mahasiswa berhasil ditambahkan',
      data: {
        id: result.insertId,
        nim,
        nama,
        prodi_id: Number(prodi_id),
        angkatan: Number(angkatan),
        foto
      }
    });
  } catch (error: any) {
    console.error("Create Mahasiswa Error:", error);
    if (req.file) deletePhotoFile(req.file.filename); // Clean up uploaded file on error
    const errorMessage = error?.code === 'ECONNREFUSED' ? 'Koneksi ke database gagal. Pastikan MySQL berjalan.' : (error?.message || 'Terjadi kesalahan');
    res.status(500).json({ message: 'Gagal menambahkan data mahasiswa', error: errorMessage });
  }
};

export const updateMahasiswa = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nim, nama, prodi_id, angkatan } = req.body;
    const newFoto = req.file ? req.file.filename : null;

    if (!nim || !nama || !prodi_id || !angkatan) {
      if (newFoto) deletePhotoFile(newFoto);
      res.status(400).json({ message: 'Semua field (nim, nama, prodi_id, angkatan) wajib diisi' });
      return;
    }

    // Get current student data to find existing photo
    const [rows] = await pool.query<RowDataPacket[]>('SELECT foto FROM mahasiswa WHERE id = ?', [id]);
    if (rows.length === 0) {
      if (newFoto) deletePhotoFile(newFoto);
      res.status(404).json({ message: 'Mahasiswa tidak ditemukan' });
      return;
    }

    const oldFoto = rows[0].foto;
    let fotoToSave = oldFoto;

    if (newFoto) {
      fotoToSave = newFoto;
      deletePhotoFile(oldFoto); // delete old photo file
    }

    const fields = ["nim = ?", "nama = ?", "prodi_id = ?", "angkatan = ?"];
    const values: any[] = [nim, nama, Number(prodi_id), Number(angkatan)];

    if (fotoToSave) {
      fields.push("foto = ?");
      values.push(fotoToSave);
    }
    values.push(id);

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE mahasiswa SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Mahasiswa tidak ditemukan' });
      return;
    }

    res.json({
      message: 'Data mahasiswa berhasil diperbarui',
      data: {
        id: Number(id),
        nim,
        nama,
        prodi_id: Number(prodi_id),
        angkatan: Number(angkatan),
        foto: fotoToSave
      }
    });
  } catch (error: any) {
    console.error("Update Mahasiswa Error:", error);
    if (req.file) deletePhotoFile(req.file.filename);
    const errorMessage = error?.code === 'ECONNREFUSED' ? 'Koneksi ke database gagal. Pastikan MySQL berjalan.' : (error?.message || 'Terjadi kesalahan');
    res.status(500).json({ message: 'Gagal memperbarui data mahasiswa', error: errorMessage });
  }
};

export const deleteMahasiswa = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Get photo filename before delete
    const [rows] = await pool.query<RowDataPacket[]>('SELECT foto FROM mahasiswa WHERE id = ?', [id]);
    if (rows.length === 0) {
      res.status(404).json({ message: 'Mahasiswa tidak ditemukan' });
      return;
    }

    const oldFoto = rows[0].foto;

    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM mahasiswa WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Mahasiswa tidak ditemukan' });
      return;
    }

    // Delete photo file if database deletion succeeded
    deletePhotoFile(oldFoto);

    res.json({
      message: 'Data mahasiswa berhasil dihapus'
    });
  } catch (error: any) {
    console.error("Delete Mahasiswa Error:", error);
    const errorMessage = error?.code === 'ECONNREFUSED' ? 'Koneksi ke database gagal. Pastikan MySQL berjalan.' : (error?.message || 'Terjadi kesalahan');
    res.status(500).json({ message: 'Gagal menghapus data mahasiswa', error: errorMessage });
  }
};
