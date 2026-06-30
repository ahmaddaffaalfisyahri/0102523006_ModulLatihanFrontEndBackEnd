"use client";

import { FormEvent, useEffect, useState, useRef } from "react";
import { Mahasiswa, MahasiswaInput, Prodi } from "@/lib/api";

type Props = {
  prodis: Prodi[];
  selectedMahasiswa: Mahasiswa | null;
  onSubmit: (payload: MahasiswaInput) => Promise<void>;
  onCancelEdit: () => void;
};

const initialForm: MahasiswaInput = {
  nim: "",
  nama: "",
  prodi_id: 0,
  angkatan: new Date().getFullYear(),
  foto: null,
};

export default function MahasiswaForm({
  prodis,
  selectedMahasiswa,
  onSubmit,
  onCancelEdit,
}: Props) {
  const [form, setForm] = useState<MahasiswaInput>(initialForm);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedMahasiswa) {
      setForm({
        nim: selectedMahasiswa.nim,
        nama: selectedMahasiswa.nama,
        prodi_id: selectedMahasiswa.prodi_id,
        angkatan: selectedMahasiswa.angkatan,
        foto: null, // Don't bind file object, keep null unless updated
      });
      if (selectedMahasiswa.foto) {
        setPreviewUrl(`http://localhost:3000/uploads/mahasiswa/${selectedMahasiswa.foto}`);
      } else {
        setPreviewUrl(null);
      }
    } else {
      setForm(initialForm);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [selectedMahasiswa]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setForm((prev) => ({ ...prev, foto: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.prodi_id === 0) {
      alert("Silakan pilih Program Studi!");
      return;
    }
    setLoading(true);

    try {
      await onSubmit(form);
      setForm(initialForm);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2>{selectedMahasiswa ? "Edit Mahasiswa" : "Tambah Mahasiswa"}</h2>

      <div className="grid">
        <div className="form-group">
          <label htmlFor="nim">NIM</label>
          <input
            id="nim"
            value={form.nim}
            onChange={(e) => setForm({ ...form, nim: e.target.value })}
            placeholder="Contoh: 2201001"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="nama">Nama</label>
          <input
            id="nama"
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            placeholder="Nama mahasiswa"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="prodi_id">Prodi</label>
          <select
            id="prodi_id"
            value={form.prodi_id}
            onChange={(e) => setForm({ ...form, prodi_id: Number(e.target.value) })}
            required
          >
            <option value={0}>-- Pilih Program Studi --</option>
            {prodis?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama_prodi}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="angkatan">Angkatan</label>
          <input
            id="angkatan"
            type="number"
            value={form.angkatan}
            onChange={(e) =>
              setForm({ ...form, angkatan: Number(e.target.value) })
            }
            required
          />
        </div>

        <div className="form-group col-span-2">
          <label htmlFor="foto">Foto Profil</label>
          <input
            id="foto"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
          {previewUrl && (
            <div style={{ marginTop: "10px" }}>
              <img
                src={previewUrl}
                alt="Preview Foto"
                style={{ maxWidth: "120px", maxHeight: "120px", borderRadius: "8px", objectFit: "cover" }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="actions">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Menyimpan..." : selectedMahasiswa ? "Update" : "Simpan"}
        </button>

        {selectedMahasiswa && (
          <button type="button" className="btn-secondary" onClick={onCancelEdit}>
            Batal Edit
          </button>
        )}
      </div>
    </form>
  );
}
