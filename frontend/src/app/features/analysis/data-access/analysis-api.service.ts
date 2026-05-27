import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface CreateAnalysisRequest {
  athlete: string;
}

export type AnalysisStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface AnalysisResponse {
  id: string;
  status: AnalysisStatus;
  foot_contact?: number;
  foot_off?: number;
  turning_point?: number;
}

@Injectable({ providedIn: 'root' })
export class AnalysisApiService {
  private readonly base = `${environment.apiUrl}/analysis`;

  constructor(private readonly http: HttpClient) {}

  create(req: CreateAnalysisRequest): Observable<AnalysisResponse> {
    return this.http.post<AnalysisResponse>(this.base, req);
  }

  getById(id: string): Observable<AnalysisResponse> {
    return this.http.get<AnalysisResponse>(`${this.base}/${id}`);
  }
}
