import { VehicleSize } from './vehicle-size.model';

export interface VehicleDTO {
  model: string;
  brand: string;
  licensePlate: string;
  size: VehicleSize;
  clientId: number;
}
