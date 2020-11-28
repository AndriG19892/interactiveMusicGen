import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AfterViewInit } from '@angular/core';

import {FormsModule} from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SynthComponent } from './synth/synth.component';
import { AmSynthComponent } from './am-synth/am-synth.component';
import { MembraneSynthComponent } from './membrane-synth/membrane-synth.component';
import { FmSynthComponent } from './fm-synth/fm-synth.component';

import { TransportComponent } from './transport/transport.component';
import { HeaderComponent } from './header/header.component';


@NgModule({
  declarations: [
    AppComponent,
    SynthComponent,
    FmSynthComponent,
    AmSynthComponent,
    MembraneSynthComponent,
    TransportComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
