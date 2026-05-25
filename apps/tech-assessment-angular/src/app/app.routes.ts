import {Route} from '@angular/router';
import {CreateDeliveryConfigurationComponent} from './create-delivery-configuration/create-delivery-configuration.component';
import {HomeComponent} from './home/home.component';

export const appRoutes: Route[] = [
  {path: '', component: HomeComponent},
  {path: 'delivery-configuration/create', component: CreateDeliveryConfigurationComponent},
];
