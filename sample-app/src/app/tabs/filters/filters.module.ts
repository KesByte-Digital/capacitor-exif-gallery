import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FiltersPageRoutingModule } from './filters-routing.module';

import { FiltersPage } from './filters.page';
import { CodeModalComponent } from '../../components/code-modal/code-modal.component';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, FiltersPageRoutingModule],
  declarations: [FiltersPage, CodeModalComponent],
})
export class FiltersPageModule {}
