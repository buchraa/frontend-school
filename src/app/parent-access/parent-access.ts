import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PublicAuthLayout } from '../public-layout/public-layout';

@Component({
  selector: 'app-parent-access',
 imports: [CommonModule, RouterLink, PublicAuthLayout],  
 templateUrl: './parent-access.html',
  styleUrl: './parent-access.css',
})
export class ParentAccess {

}
