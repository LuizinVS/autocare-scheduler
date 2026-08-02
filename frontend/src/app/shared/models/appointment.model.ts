import { Client } from './client.model';
import { Vehicle } from './vehicle.model';
import { ServiceType } from './service-type.model';
import { AppointmentStatus } from './appointment-status.model';

export interface Appointment {
  id: number;
  client: Client;
  vehicle: Vehicle;
  serviceType: ServiceType;
  priceAtBooking: number;
  scheduledDateTime: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
}
