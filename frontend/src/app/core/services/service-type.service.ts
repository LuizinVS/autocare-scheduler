import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiPage } from '../../shared/models/api-page.model';
import { ServiceType } from '../../shared/models/service-type.model';
import { ServiceTypeDTO } from '../../shared/models/service-type-dto.model';
import { buildHttpParams } from '../../shared/utils/http-params';

@Injectable({
  providedIn: 'root'
})
export class ServiceTypeService {
  private readonly apiUrl = `${environment.apiUrl}/service-types`;

  constructor(private readonly http: HttpClient) {}

  list(page = 0, size = 20): Observable<ApiPage<ServiceType>> {
    return this.http.get<ApiPage<ServiceType>>(this.apiUrl, { params: buildHttpParams({ page, size }) });
  }

  getById(id: number): Observable<ServiceType> {
    return this.http.get<ServiceType>(`${this.apiUrl}/${id}`);
  }

  create(serviceType: ServiceTypeDTO): Observable<ServiceType> {
    return this.http.post<ServiceType>(this.apiUrl, serviceType);
  }

  update(id: number, serviceType: ServiceTypeDTO): Observable<ServiceType> {
    return this.http.put<ServiceType>(`${this.apiUrl}/${id}`, serviceType);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
