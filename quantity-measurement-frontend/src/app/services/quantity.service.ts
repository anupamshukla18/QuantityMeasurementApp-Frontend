import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { QuantityInputDTO, QuantityMeasurementDTO } from '../models/quantity.model';

@Injectable({ providedIn: 'root' })
export class QuantityService {
  private apiUrl = `${environment.apiUrl}/api/v1/quantities`;

  constructor(private http: HttpClient) {}

  compare(data: QuantityInputDTO): Observable<QuantityMeasurementDTO> {
    return this.http.post<QuantityMeasurementDTO>(`${this.apiUrl}/compare`, data);
  }

  add(data: QuantityInputDTO): Observable<QuantityMeasurementDTO> {
    return this.http.post<QuantityMeasurementDTO>(`${this.apiUrl}/add`, data);
  }

  convert(data: QuantityInputDTO): Observable<QuantityMeasurementDTO> {
    return this.http.post<QuantityMeasurementDTO>(`${this.apiUrl}/convert`, data);
  }

  getHistory(operation: string): Observable<QuantityMeasurementDTO[]> {
    return this.http.get<QuantityMeasurementDTO[]>(`${this.apiUrl}/history/operation/${operation}`);
  }
}
