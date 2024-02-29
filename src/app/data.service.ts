import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private baseUrl = 'http://localhost:8080/api'; // Your Spring Boot API URL

  constructor(private http: HttpClient) { }

  getData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/data`);
  }

  // Implement other methods for POST, PUT, DELETE as needed
}
