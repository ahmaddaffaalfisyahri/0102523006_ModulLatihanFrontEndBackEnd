"use client";

import { Mahasiswa } from "@/lib/api";

type Props = {
  mahasiswa: Mahasiswa[];
  onEdit: (item: Mahasiswa) => void;
  onDelete: (id: number) => Promise<void>;
};

export default function MahasiswaTable({ mahasiswa, onEdit, onDelete }: Props) {
  if (mahasiswa.length === 0) {
    return <p>Belum ada data mahasiswa.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>No</th>
          <th>Foto</th>
          <th>NIM</th>
          <th>Nama</th>
          <th>Prodi</th>
          <th>Angkatan</th>
          <th>Aksi</th>
        </tr>
      </thead>

      <tbody>
        {mahasiswa.map((item, index) => {
          const photoUrl = item.foto 
            ? `http://localhost:3000/uploads/mahasiswa/${item.foto}`
            : null;

          return (
            <tr key={item.id}>
              <td>{index + 1}</td>
              <td>
                {photoUrl ? (
                  <img 
                    src={photoUrl} 
                    alt={item.nama} 
                    style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover" }}
                  />
                ) : (
                  <div style={{ 
                    width: "50px", 
                    height: "50px", 
                    borderRadius: "50%", 
                    backgroundColor: "#ccc", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    fontSize: "12px",
                    color: "#666"
                  }}>
                    No Foto
                  </div>
                )}
              </td>
              <td>{item.nim}</td>
              <td>{item.nama}</td>
              <td>{item.nama_prodi || "Tidak ada prodi"}</td>
              <td>{item.angkatan}</td>
              <td>
                <div className="actions">
                  <button className="btn-secondary" onClick={() => onEdit(item)}>
                    Edit
                  </button>

                  <button className="btn-danger" onClick={() => {
                    if (confirm(`Apakah Anda yakin ingin menghapus mahasiswa ${item.nama}?`)) {
                      onDelete(item.id);
                    }
                  }}>
                    Hapus
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
