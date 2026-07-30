import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiPage } from '../../shared/models/api-page.model';
import { Vehicle } from '../../shared/models/vehicle.model';
import { VehicleDTO } from '../../shared/models/vehicle-dto.model';
import { buildHttpParams } from '../../shared/utils/http-params';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private readonly apiUrl = `${environment.apiUrl}/vehicles`;

  constructor(private readonly http: HttpClient) {}

  list(page = 0, size = 20): Observable<ApiPage<Vehicle>> {
    return this.http.get<ApiPage<Vehicle>>(this.apiUrl, { params: buildHttpParams({ page, size }) });
  }

  getById(id: number): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.apiUrl}/${id}`);
  }

  create(vehicle: VehicleDTO): Observable<Vehicle> {
    return this.http.post<Vehicle>(this.apiUrl, vehicle);
  }
}
