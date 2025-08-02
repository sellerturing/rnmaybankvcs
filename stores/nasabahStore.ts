import { create } from 'zustand';
import { DataNasabah, NasabahState } from '../types/nasabah';

const initialDataNasabah: DataNasabah = {
  namaLengkap: '',
  alamat: '',
  nomorTelpon: '',
};

export const useNasabahStore = create<NasabahState>(set => ({
  dataNasabah: initialDataNasabah,

  setNamaLengkap: (nama: string) =>
    set(state => ({
      dataNasabah: { ...state.dataNasabah, namaLengkap: nama },
    })),

  setAlamat: (alamat: string) =>
    set(state => ({
      dataNasabah: { ...state.dataNasabah, alamat },
    })),

  setNomorTelpon: (nomor: string) =>
    set(state => ({
      dataNasabah: { ...state.dataNasabah, nomorTelpon: nomor },
    })),

  setDataNasabah: (data: Partial<DataNasabah>) =>
    set(state => ({
      dataNasabah: { ...state.dataNasabah, ...data },
    })),

  resetDataNasabah: () => set({ dataNasabah: initialDataNasabah }),
}));
