CREATE DATABASE IF NOT EXISTS kampus;

USE kampus;

DROP TABLE IF EXISTS mahasiswa;
DROP TABLE IF EXISTS prodi;

CREATE TABLE IF NOT EXISTS prodi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_prodi VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mahasiswa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nim VARCHAR(20) NOT NULL UNIQUE,
  nama VARCHAR(100) NOT NULL,
  prodi_id INT NOT NULL,
  angkatan INT NOT NULL,
  foto VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_mahasiswa_prodi
    FOREIGN KEY (prodi_id) REFERENCES prodi(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

INSERT INTO prodi (nama_prodi) VALUES
('Informatika'),
('Sistem Informasi'),
('Teknik Elektro'),
('Manajemen'),
('Akuntansi');

INSERT INTO mahasiswa (nim, nama, prodi_id, angkatan) VALUES 
('2201001', 'Ahmad Fauzi', 1, 2022),
('2201002', 'Budi Santoso', 2, 2022);
