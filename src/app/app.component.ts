import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  company = {
    commercialName: '',
    legalName: '',
    allAvailableNames: '',
    phoneNumbers: '',
    socialMediaLinks: '',
    address: '',
    url: ''
  };
  responseMessage: string = '';
  receivedCompany: any;
  selectedFile: File | null = null;
  selectedFileName: string = '';
  loading: boolean = false;
  crawlURL: string = '';

  constructor(private http: HttpClient) {}

  submitForm() {
    const startTime = Date.now();
    this.loading = true;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    this.http.post<any>('http://localhost:8080/api/company/match', this.company, httpOptions)
      .subscribe(
        response => {
          console.log(response);
          this.loading = false;
          const endTime = Date.now();
          const elapsedTime = (endTime - startTime) / 1000;
          this.responseMessage = `Company matched successfully! Time elapsed: ${elapsedTime} seconds.`;
          this.receivedCompany = response;
        },
        error => {
          this.loading = false;
          console.error(error);
          this.responseMessage = 'Error matching company!';
          this.receivedCompany = 'Company not found';
        }
      );
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    this.selectedFileName = event.target.files[0].name;
  }

  uploadFile() {
    if (this.selectedFile) {
      this.loading = true;
      const formData = new FormData();
      formData.append('file', this.selectedFile);

      this.http.post<any>('http://localhost:8080/api/company/merge', formData, { responseType: 'blob' as 'json' })
        .subscribe(
          response => {
            this.downloadFile(response, 'all_data_');
            this.loading = false;
            console.log(response);
            this.responseMessage = 'File merged successfully!';
          },
          error => {
            this.loading = false;
            console.error(error);
            this.responseMessage = 'Error merging file!';
          }
        );
    } else {
      this.responseMessage = 'Please select a file to upload.';
    }
  }

  crawlCSV(url?: string) {
    const startTime = Date.now();

    if (url) {
      this.loading = true;

      this.http.post<any>('http://localhost:8080/api/company/crawl', null, {
        params: {
          url: url
        },
        responseType: 'blob' as 'json'
      })
        .subscribe(
          (response: any) => {
            this.downloadFile(response, 'company_');
            const endTime = Date.now();
            const elapsedTime = (endTime - startTime) / 1000;
            this.responseMessage = `URL crawled and company downloaded successfully! Time elapsed: ${elapsedTime} seconds.`;
            this.loading = false;
          },
          error => {
            console.error(error);
            this.responseMessage = 'Error crawling URL!';
            this.loading = false;
          }
        );
    } else {
      if (this.selectedFile) {
        this.loading = true;
        const formData = new FormData();
        formData.append('file', this.selectedFile);

        this.http.post<any>('http://localhost:8080/api/company/crawl', formData, { responseType: 'blob' as 'json' })
          .subscribe(
            (response: any) => {
              this.downloadFile(response, 'companies_');
              const endTime = Date.now();
              const elapsedTime = (endTime - startTime) / 1000;
              this.responseMessage = `CSV crawled and downloaded successfully! Time elapsed: ${elapsedTime} seconds.`;
              this.loading = false;
            },
            error => {
              console.error(error);
              this.responseMessage = 'Error crawling CSV!';
              this.loading = false;
            }
          );
      } else {
        this.responseMessage = 'Please select a CSV file to crawl.';
      }
    }
  }

  private downloadFile(data: any, filename: string) {
    const formattedDate = this.getFormattedDate();
    filename += `${formattedDate}.csv`;

    const blob = new Blob([data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  private getFormattedDate(): string {
    const now = new Date();
    const hhmm = this.padZero(now.getHours()) + this.padZero(now.getMinutes());
    const dd = this.padZero(now.getDate());
    const mm = this.padZero(now.getMonth() + 1);
    const yyyy = now.getFullYear();
    return `${hhmm}_${dd}${mm}${yyyy}`;
  }

  private padZero(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }
}
