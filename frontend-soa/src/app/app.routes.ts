import { Routes } from '@angular/router';

import { BlogListComponent } from './components/blog-list/blog-list.component';
import { TourListComponent } from './components/tour-list/tour-list.component';
import { TourCreateComponent } from './components/tour-create/tour-create.component';
import { TourEditComponent } from './components/tour-edit/tour-edit.component';
import { KeypointListComponent } from './components/keypoint-list/keypoint-list.component';
import { KeypointCreateComponent } from './components/keypoint-create/keypoint-create.component';
import { KeypointEditComponent } from './components/keypoint-edit/keypoint-edit.component';
import { UserProfileComponent } from './pages/user-profile/user-profile';
import { HomeComponent } from './pages/home/home';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { Simulator } from './pages/simulator/simulator';
import { TourExecution } from './models/tour-execution.model';
import { TourExecutionComponent } from './components/tour-execution/tour-execution';
import { AdminUsersComponent } from './components/admin-users/admin-users.component';


export const routes: Routes = [
  { path: '', redirectTo: '/blogs', pathMatch: 'full' },
  { path: 'blogs', component: BlogListComponent },
  { path: 'tours', component: TourListComponent },
  { path: 'tours/create', component: TourCreateComponent },
  { path: 'tours/edit/:id', component: TourEditComponent },
  { path: 'tours/:tourId/keypoints', component: KeypointListComponent },
  { path: 'tours/:tourId/keypoints/create', component: KeypointCreateComponent },
  { path: 'tours/:tourId/keypoints/edit/:keyPointId', component: KeypointEditComponent },
  { path: '', component: HomeComponent },
  { path: 'profile/:userId', component: UserProfileComponent },
  { path: 'profile', component: UserProfileComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'simulator', component: Simulator }, 
  { path: 'tour-execution/:id', component: TourExecutionComponent},
  { path: 'admin/users', component: AdminUsersComponent }

];
