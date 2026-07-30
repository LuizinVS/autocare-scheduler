import { Client } from './client.model';

export interface Vehicle {
  id: number;
  model: string;
  brand: string;
  licensePlate: string;
  client: Client;
  createdAt: string;
}
