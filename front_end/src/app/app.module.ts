import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [
    AppComponent  // Only the root component is declared in AppModule
  ],
  imports: [
    BrowserModule,
    CoreModule,        // CoreModule now declares & exports header, footer, and error components
    SharedModule,      // SharedModule for pipes, widgets, etc.
    AppRoutingModule  // Routing module for feature modules and default routes
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
