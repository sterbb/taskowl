import { Component } from '@angular/core';
import { ElectronService } from '../core/services';
import { MainpageService } from '../core/services/main.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-widget',
  standalone: true,
  imports: [],
  templateUrl: './widget.component.html',
  styleUrl: './widget.component.scss'
})
export class WidgetComponent {

  constructor(private mainPage:MainpageService, private router: Router, private electronService:ElectronService) {
    
  }


}
