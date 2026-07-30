import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiPage } from '../../shared/models/api-page.model';
import { Appointment } from '../../shared/models/appointment.model';
import { Client } from '../../shared/models/client.model';
import { ClientDTO } from '../../shared/models/client-dto.model';
import { Vehicle } from '../../shared/models/vehicle.model';
import { buildHttpParams } from '../../shared/utils/http-params';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private readonly apiUrl = `${environment.apiUrl}/clients`;

  constructor(private readonly http: HttpClient) {}

  list(page = 0, size = 20): Observable<ApiPage<Client>> {
    return this.http.get<ApiPage<Client>>(this.apiUrl, { params: buildHttpParams({ page, size }) });
  }

  getById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`);
  }

  create(client: ClientDTO): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, client);
  }

  getVehicles(id: number): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.apiUrl}/${id}/vehicles`);
  }

  getAppointments(id: number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/${id}/appointments`);
  }
}