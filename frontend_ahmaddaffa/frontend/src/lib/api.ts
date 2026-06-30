export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export type Mahasiswa = {
  id: number;
  nim: string;
  nama: string;
  prodi_id: number;
  nama_prodi?: string;
  angkatan: number;
  foto: string | null;
  created_at?: string;
};

export type MahasiswaInput = {
  nim: string;
  nama: string;
  prodi_id: number;
  angkatan: number;
  foto?: File | null;
};

export type Prodi = {
  id: number;
  nama_prodi: string;
};

type ApiResponse<T> = {
  message: string;
  data?: T;
};

export type PaginatedMahasiswaResponse = {
  message: string;
  data: Mahasiswa[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPage: number;
  };
};

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Terjadi kesalahan saat mengakses API");
  }

  return result;
}

export async function getMahasiswa(params?: {
  page?: number;
  limit?: number;
  search?: string;
  prodi_id?: string | number;
}): Promise<PaginatedMahasiswaResponse> {
  const query = new URLSearchParams();
  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));
  if (params?.search) query.append("search", params.search);
  if (params?.prodi_id) query.append("prodi_id", String(params.prodi_id));

  const response = await fetch(`${API_URL}/mahasiswa?${query.toString()}`, {
    cache: "no-store",
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Terjadi kesalahan saat mengambil data");
  }
  return result as PaginatedMahasiswaResponse;
}

export async function getProdi(): Promise<Prodi[]> {
  const response = await fetch(`${API_URL}/prodi`, {
    cache: "no-store",
  });

  const result = await handleResponse<Prodi[]>(response);
  return result.data || [];
}

export async function createMahasiswa(
  payload: MahasiswaInput
): Promise<Mahasiswa> {
  const formData = new FormData();
  formData.append("nim", payload.nim);
  formData.append("nama", payload.nama);
  formData.append("prodi_id", String(payload.prodi_id));
  formData.append("angkatan", String(payload.angkatan));
  if (payload.foto) {
    formData.append("foto", payload.foto);
  }

  const response = await fetch(`${API_URL}/mahasiswa`, {
    method: "POST",
    body: formData,
  });

  const result = await handleResponse<Mahasiswa>(response);
  return result.data as Mahasiswa;
}

export async function updateMahasiswa(
  id: number,
  payload: MahasiswaInput
): Promise<void> {
  const formData = new FormData();
  formData.append("nim", payload.nim);
  formData.append("nama", payload.nama);
  formData.append("prodi_id", String(payload.prodi_id));
  formData.append("angkatan", String(payload.angkatan));
  if (payload.foto) {
    formData.append("foto", payload.foto);
  }

  const response = await fetch(`${API_URL}/mahasiswa/${id}`, {
    method: "PUT",
    body: formData,
  });

  await handleResponse(response);
}

export async function deleteMahasiswa(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/mahasiswa/${id}`, {
    method: "DELETE",
  });

  await handleResponse(response);
}
