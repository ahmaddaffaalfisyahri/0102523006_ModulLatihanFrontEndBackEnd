import { Request, Response } from 'express';
import pool from '../config/db';
import { RowDataPacket } from 'mysql2';

export const getProdi = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT id, nama_prodi FROM prodi ORDER BY nama_prodi ASC');
    res.json({
      message: 'Data prodi berhasil diambil',
      data: rows
    });
  } catch (error: any) {
    console.error("Get Prodi Error:", error);
    res.status(500).json({ 
      message: 'Gagal mengambil data prodi', 
      error: error?.message || 'Terjadi kesalahan' 
    });
  }
};
export const getAllProdi = getProdi;
