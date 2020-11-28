import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

import Tone from 'tone';


@Component({
  selector: 'app-transport',
  templateUrl: './transport.component.html',
  styleUrls: ['./transport.component.css']
})
export class TransportComponent implements OnInit, AfterViewInit {

  public bpm: number;
  public transportPosition: string;
  public transportTimeSignature: number;
  public testRandomNumber: number;
  // sending data from data model to view
  //@ViewChild("transportPositionText") nameElementRef: ElementRef;
  

  constructor() {
    Tone.Transport.bpm.value = 100;
    this.bpm = Tone.Transport.bpm.value;
    this.transportPosition = Tone.Transport.position;
    this.transportTimeSignature = Tone.Transport.timeSignature;
    this.testRandomNumber = Math.random();

    setInterval(function() {
      this.testRandomNumber = Math.random();
      this.transportPosition = Tone.Transport.position;
      //console.log(this.testRandomNumber);
      //console.log(this.transportPosition);
    }, 200)    

  }

  ngOnInit() {
    
  }

  ngAfterViewInit() {
    //this.nameElementRef.nativeElement.value = Tone.Transport.position;
    //console.log(this.nameElementRef);
  }

returnTransportPosition() {
  return Tone.Transport.position;
}
  


  // TRANSPORT CONTROL FUNCTIONS
  onPlayPressed() {
    this.bpm = Tone.Transport.bpm.value;
    Tone.Transport.start();
    console.log("Transport " + Tone.Transport.state);
  }

  onPausePressed() {
    Tone.Transport.pause();
    console.log("Transport " + Tone.Transport.state);
  }

  onStopPressed() {
    Tone.Transport.stop();
    console.log("Transport " + Tone.Transport.state);
  }


  onBpmChange(event) {
    this.bpm = event.target.value;
    Tone.Transport.bpm.value = this.bpm;
    //console.log(Tone.Transport.bpm.value + " bpm"); // commented because, since string formatting is CPU expensive, it was causing crashes
  }

  onTimeSignatureChange(event) {
    Tone.Transport.timeSignature = event.target.value;
    this.transportTimeSignature = Tone.Transport.timeSignature;
    console.log("time signature = " + Tone.Transport.timeSignature);
  }

  onBpmRampTriggered(bpmDestinationValue,speed) {
    console.log("Transport ramp triggered, to " + bpmDestinationValue.value + " bpm, in " + speed.value + " seconds.")
    Tone.Transport.bpm.rampTo(bpmDestinationValue.value,speed.value);
  }

}
