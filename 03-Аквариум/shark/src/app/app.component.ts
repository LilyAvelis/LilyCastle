import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="container">
      <h1>Shark - Angular Test</h1>
      <p>This is a test Angular application using the centralized library.</p>
    </div>
  `,
  styles: [`
    .container {
      text-align: center;
      margin-top: 50px;
    }
    h1 {
      color: #007bff;
    }
  `]
})
export class AppComponent {
  title = 'shark';
}