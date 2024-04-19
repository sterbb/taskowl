import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WidgetRoutingModule } from './widget-routing.module';
import { WidgetComponent } from './widget.component';
import { SharedModule } from '../shared/shared.module';

import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@NgModule({
  declarations: [WidgetComponent],
  imports: [CommonModule, SharedModule, WidgetRoutingModule]
})
export class WidgetModule {}
