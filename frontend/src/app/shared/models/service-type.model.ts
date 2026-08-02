import { ServicePrice } from './service-price.model';

export interface ServiceType {
  id: number;
  name: string;
  prices: ServicePrice[];
  createdAt: string;
}
