"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MahasiswaForm from "@/components/MahasiswaForm";
import MahasiswaTable from "@/components/MahasiswaTable";
import {
  createMahasiswa,
  deleteMahasiswa,
  getMahasiswa,
  getProdi,
  Mahasiswa,
  MahasiswaInput,
  Prodi,
  updateMahasiswa,
} from "@/lib/api";

export default function MahasiswaPage() {
  const [mahasiswa, setMahasiswa] = useState<Mahasiswa[]>([]);
  const [prodis, setProdis] = useState<Prodi[]>([]);
  const [selectedMahasiswa, setSelectedMahasiswa] = useState<Mahasiswa | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Search, Filter, Pagination States
  const [search, setSearch] = useState("");
  const [prodiFilter, setProdiFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(5); // Show 5 items per page
  const [pagination, setPagination] = useState({
    total: 0,
    totalPage: 1,
  });

  const loadProdi = async () => {
    try {
      const data = await getProdi();
      setProdis(data);
    } catch (err) {
      console.error("Gagal mengambil data prodi:", err);
    }
  };

  const loadMahasiswa = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getMahasiswa({
        page,
        limit,
        search,
        prodi_id: prodiFilter,
      });
      setMahasiswa(response.data);
      setPagination({
        total: response.meta.total,
        totalPage: response.meta.totalPage,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengambil data mahasiswa");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProdi();
  }, []);

  // Fetch mahasiswa when filters or page changes
  useEffect(() => {
    loadMahasiswa();
  }, [page, prodiFilter, search]);

  const handleSubmit = async (payload: MahasiswaInput) => {
    try {
      setMessage("");
      setError("");

      if (selectedMahasiswa) {
        await updateMahasiswa(selectedMahasiswa.id, payload);
        setMessage("Data mahasiswa berhasil diperbarui");
      } else {
        await createMahasiswa(payload);
        setMessage("Data mahasiswa berhasil ditambahkan");
      }

      setSelectedMahasiswa(null);
      setPage(1); // Go to first page to see changes
      await loadMahasiswa();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan data");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setMessage("");
      setError("");
      await deleteMahasiswa(id);
      setMessage("Data mahasiswa berhasil dihapus");
      await loadMahasiswa();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus data");
    }
  };

  return (
    <main className="container" style={{ paddingBottom: "40px" }}>
      <div className="header">
        <div>
          <h1>CRUD Data Mahasiswa</h1>
          <p>Frontend Next.js yang terhubung ke backend Express.js.</p>
        </div>

        <Link href="/">
          <button className="btn-secondary">Kembali</button>
        </Link>
      </div>

      {message && <div className="message">{message}</div>}
      {error && <div className="message error">{error}</div>}

      <MahasiswaForm
        prodis={prodis}
        selectedMahasiswa={selectedMahasiswa}
        onSubmit={handleSubmit}
        onCancelEdit={() => setSelectedMahasiswa(null)}
      />

      <section className="card" style={{ marginTop: 20 }}>
        <div className="search-filter-container">
          <h2 style={{ marginBottom: 0 }}>Daftar Mahasiswa</h2>
          
          {/* Filters */}
          <div className="filter-controls">
            <input 
              type="text" 
              placeholder="Cari nama..." 
              value={search} 
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); // Reset to page 1 on search
              }}
              className="filter-input"
            />
            
            <select
              value={prodiFilter}
              onChange={(e) => {
                setProdiFilter(e.target.value);
                setPage(1); // Reset to page 1 on filter
              }}
              className="filter-select"
            >
              <option value="">Semua Prodi</option>
              {prodis.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama_prodi}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p>Memuat data...</p>
        ) : (
          <>
            <MahasiswaTable
              mahasiswa={mahasiswa}
              onEdit={setSelectedMahasiswa}
              onDelete={handleDelete}
            />

            {/* Pagination Controls */}
            {pagination.totalPage > 1 && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "15px", marginTop: "20px" }}>
                <button
                  className="btn-secondary"
                  disabled={page <= 1}
                  onClick={() => setPage(prev => prev - 1)}
                  style={{ padding: "5px 12px" }}
                >
                  Sebelumnya
                </button>
                <span>
                  Halaman {page} dari {pagination.totalPage}
                </span>
                <button
                  className="btn-secondary"
                  disabled={page >= pagination.totalPage}
                  onClick={() => setPage(prev => prev + 1)}
                  style={{ padding: "5px 12px" }}
                >
                  Selanjutnya
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
