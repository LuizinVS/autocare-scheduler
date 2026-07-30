import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiPage } from '../../shared/models/api-page.model';
import { Appointment } from '../../shared/models/appointment.model';
import { AppointmentDTO } from '../../shared/models/appointment-dto.model';
import { AppointmentStatus } from '../../shared/models/appointment-status.model';
import { AppointmentStatusUpdateDTO } from '../../shared/models/appointment-status-update-dto.model';
import { buildHttpParams } from '../../shared/utils/http-params';

export interface AppointmentFilters {
  status?: AppointmentStatus | null;
  date?: string | null;
  clientId?: number | null;
  page?: number;
  size?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private readonly apiUrl = `${environment.apiUrl}/appointments`;

  constructor(private readonly http: HttpClient) {}

  list(filters: AppointmentFilters = {}): Observable<ApiPage<Appointment>> {
    return this.http.get<ApiPage<Appointment>>(this.apiUrl, {
      params: buildHttpParams({
        status: filters.status,
        date: filters.date,
        clientId: filters.clientId,
        page: filters.page ?? 0,
        size: filters.size ?? 20
      })
    });
  }

  getById(id: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.apiUrl}/${id}`);
  }

  create(appointment: AppointmentDTO): Observable<Appointment> {
    return this.http.post<Appointment>(this.apiUrl, appointment);
  }

  update(id: number, appointment: AppointmentDTO): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.apiUrl}/${id}`, appointment);
  }

  updateStatus(id: number, status: AppointmentStatus): Observable<Appointment> {
    const payload: AppointmentStatusUpdateDTO = { status };
    return this.http.patch<Appointment>(`${this.apiUrl}/${id}/status`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  availability(date: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/availability`, {
      params: buildHttpParams({ date })
    });
  }
}
