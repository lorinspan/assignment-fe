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
  receivedCompany: any; // Variable to hold the received company
  selectedFile: File | null = null;
  selectedFileName: string = ''; // Variable to hold the selected file name
  loading: boolean = false; // Loading flag for crawling
  crawlURL: string = '';


  constructor(private http: HttpClient) {}

  submitForm() {
    const startTime = Date.now(); // Record the start time before making the request
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
          const endTime = Date.now(); // Record the end time upon receiving the response
          const elapsedTime = (endTime - startTime) / 1000; // Calculate elapsed time in seconds
          this.responseMessage = `Company matched successfully! Time elapsed: ${elapsedTime} seconds.`;
          this.receivedCompany = response; // Store the received company
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
    const startTime = Date.now(); // Record the start time before making the request

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
    const startTime = Date.now(); // Record the start time before making the request

    if (url) {
      // Crawl the provided URL
      this.loading = true; // Show loading animation for crawling

      this.http.post<any>('http://localhost:8080/api/company/crawl', null, {
        params: {
          url: url
        },
        responseType: 'blob' as 'json'
      })
        .subscribe(
          (response: any) => {
            this.downloadFile(response, 'company_');
            const endTime = Date.now(); // Record the end time upon receiving the response
            const elapsedTime = (endTime - startTime) / 1000; // Calculate elapsed time in seconds
            this.responseMessage = `URL crawled and company downloaded successfully! Time elapsed: ${elapsedTime} seconds.`;
            this.loading = false; // Hide loading animation after crawling
          },
          error => {
            console.error(error);
            this.responseMessage = 'Error crawling URL!';
            this.loading = false; // Hide loading animation after crawling
          }
        );
    } else {
      // Crawl the CSV file
      if (this.selectedFile) {
        this.loading = true; // Show loading animation for crawling
        const formData = new FormData();
        formData.append('file', this.selectedFile);

        this.http.post<any>('http://localhost:8080/api/company/crawl', formData, { responseType: 'blob' as 'json' })
          .subscribe(
            (response: any) => {
              this.downloadFile(response, 'companies_');
              const endTime = Date.now(); // Record the end time upon receiving the response
              const elapsedTime = (endTime - startTime) / 1000; // Calculate elapsed time in seconds
              this.responseMessage = `CSV crawled and downloaded successfully! Time elapsed: ${elapsedTime} seconds.`;
              this.loading = false; // Hide loading animation after crawling
            },
            error => {
              console.error(error);
              this.responseMessage = 'Error crawling CSV!';
              this.loading = false; // Hide loading animation after crawling
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
    const mm = this.padZero(now.getMonth() + 1); // Months are zero based
    const yyyy = now.getFullYear();
    return `${hhmm}_${dd}${mm}${yyyy}`;
  }

  private padZero(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }
}
