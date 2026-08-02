import { Client } from './client.model';
import { VehicleSize } from './vehicle-size.model';

export interface Vehicle {
  id: number;
  model: string;
  brand: string;
  licensePlate: string;
  size: VehicleSize;
  client: Client;
  createdAt: string;
}
