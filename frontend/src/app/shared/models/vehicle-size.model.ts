export type VehicleSize = 'PEQUENO' | 'MEDIO' | 'GRANDE' | 'SUV';

export const vehicleSizes: VehicleSize[] = ['PEQUENO', 'MEDIO', 'GRANDE', 'SUV'];

export const vehicleSizeLabels: Record<VehicleSize, string> = {
  PEQUENO: 'Pequeno',
  MEDIO: 'Médio',
  GRANDE: 'Grande',
  SUV: 'SUV'
};
