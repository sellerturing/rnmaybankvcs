export interface DataNasabah {
  namaLengkap: string;
  alamat: string;
  nomorTelpon: string;
}

export interface NasabahState {
  dataNasabah: DataNasabah;
  setNamaLengkap: (nama: string) => void;
  setAlamat: (alamat: string) => void;
  setNomorTelpon: (nomor: string) => void;
  setDataNasabah: (data: Partial<DataNasabah>) => void;
  resetDataNasabah: () => void;
}