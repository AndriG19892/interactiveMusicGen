import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import Tone from 'tone';
import { Note, Interval, Distance, Scale, Chord } from "tonal";
import Chance from 'chance';

import { notEqual } from 'assert';
import { timeout } from 'q';

import { Pattern } from './pattern';
import { Phrase } from './phrase';
import { scalePitches } from './scalePitches';

@Component({
  selector: 'app-am-synth',
  templateUrl: './am-synth.component.html',
  styleUrls: ['./am-synth.component.css'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class AmSynthComponent implements OnInit {

  public randomChance : any;

  public isDataForPhraseShown : boolean[] = [false,false,false,false,false,false,false,false,false,false]; // max 10 phrases
  public isDataForFitnessShown : boolean = false;
  public isPartShown : boolean = false;
  public isSynthShown : boolean = false;
  public areEffectsShown : boolean = false;
  public isInstrumentShown : boolean = false;
  public isDataForPatternShown : boolean[][] = [[false,false,false,false,false,false,false,false,false,false],
                                                [false,false,false,false,false,false,false,false,false,false],
                                                [false,false,false,false,false,false,false,false,false,false],
                                                [false,false,false,false,false,false,false,false,false,false],
                                                [false,false,false,false,false,false,false,false,false,false],
                                                [false,false,false,false,false,false,false,false,false,false],
                                                [false,false,false,false,false,false,false,false,false,false],
                                                [false,false,false,false,false,false,false,false,false,false],
                                                [false,false,false,false,false,false,false,false,false,false],
                                                [false,false,false,false,false,false,false,false,false,false]]; // array of arrays, max 10 phrases max 10 patterns in phrase public


  public pitchesFitnessOfPart: number;  // just the sum of each phrase's fitness
  public intervalsFitnessOfPart: number;
  public overallFitnessOfPart: number;

  public numberOfPhrasesInPart;
  public scaleTonic : string;
  public scaleType : string;
  public lowerPitchRange : number;
  public upperPitchRange : number;
  public lowerRhythmRange : number;
  public upperRhythmRange : number;
  public lowerRhythmRangeMultiplications : number;
  public upperRhythmRangeMultiplications : number;
  public intervalsFitness : number[] = [0,0,0,0,0,0,0];
  public intervalsWeight : number = 0;
  public pitchesFitness : number[] = [0,0,0,0,0,0,0];
  public pitchesWeight : number = 0;

  public octaveOffset : number[] = [,,,,,,,,,]; // max 10 phrases
  public notesOffset : number[] = [,,,,,,,,,]; // max 10 phrases
  public rhythmicOffset : number[] = [,,,,,,,,,]; // max 10 phrases

  public notesRestsLikelihood : number[] = [,,,,,,,,,]; // max 10 phrases
  public notesRestsSeed : number[] = [,,,,,,,,,]; // max 10 phrases

  public arrayOfPhrases : Phrase[] = [,,,,,,,,,];  // max 10 phrases
  public numberOfPatternsInEachPhrase = Array;
  // numberOfEventsInEachPattern[number of phrase][number of pattern]
  public numberOfEventsInEachPattern : number[][] = [[],[],[],[],[],[],[],[],[],[]] // array of arrays, max 10 phrases  public
  public melodicSeedForEachPattern : number[][] = [[],[],[],[],[],[],[],[],[],[]] // array of arrays, max 10 phrases  public
  public rhythmicSeedForEachPattern : number[][] = [[],[],[],[],[],[],[],[],[],[]] // array of arrays, max 10 phrases  public

  public panner = new Tone.Panner(); 
  public delay = new Tone.PingPongDelay();
  public reverb = new Tone.JCReverb();
  public synth = new Tone.AMSynth();
  public isSynthSynced = true;
  public arrayOfEvents = [];
  private previousVolume = this.synth.volume.value;
  private isSynthMuted = false;
  public event: any;
  public part: any;
  // PART related variables, used as placeholders from which values will be copied every time a new Part instance is created (see onPartPlay())
  public partLoop = false;
  public partLoopStart = 0;
  public partLoopEnd = 0;
  public partPlayBackRate = 1;
  public partProbability = 1;
  public partMute = false;
  public partHumanize = false;

  constructor() {
this.scaleTonic = "C";
this.scaleType = "aeolian";
console.log(Scale.names());
// generate a purely random seed
this.randomChance = new Chance(Math.random());

// CALCULATE this.partLoopEnd and this.partLoopStart
this.partLoopStart = 0;
this.partLoopEnd = this.partLoopStart;
for (var _i = 0; _i < this.numberOfPhrasesInPart; _i++) {
  this.partLoopEnd += this.arrayOfPhrases[_i].entireDurationOfPhrase;
  console.log('AM SYNTH \n\tduration of phrase ' + _i + ' = ' + this.arrayOfPhrases[_i].entireDurationOfPhrase);
}
console.log('AM SYNTH \n\tloop end = ' + this.partLoopEnd);

// OLD initilialisations
    this.synth.chain(this.panner,this.delay,this.reverb,Tone.Master); // https://github.com/Tonejs/Tone.js/wiki/Connections
    this.synth.envelope.attack = 0.5;
    this.synth.envelope.decay = 0.2;
    this.synth.envelope.sustain = 0.1;
    this.synth.modulationEnvelope.sustain = 0.2;
    this.synth.envelope.release = 0.5;
    this.panner.pan.value = 0; // initial pan: center
    this.delay.wet.value = 0.08;
    this.reverb.wet.value = 0.2;

    Tone.Transport.schedule(function(time){
      this.transportPosition = Tone.Transport.position;
      console.log(this.transportPosition);
      }, "16n");

      // an object of type Part needs to be initialised with a valid callback
      this.part = new Tone.Part(function(time, value){
        this.synth.triggerAttackRelease(value.note, "16n", "@64n", value.velocity);
      }, this.arrayOfEvents);
      // since the UI elements are binded with Tone.Part values, they need to be explicitly initialised with some value at the beginning
      this.part.loop = this.partLoop;
      this.part.loopStart = this.partLoopStart;
      this.part.loopEnd = this.partLoopEnd;
      this.part.playbackRate = this.partPlayBackRate;
      this.part.probability = this.partProbability;
      this.part.mute = this.partMute;
      this.part.humanize = this.partHumanize;
      this.part.stop();

   // FILL this.arrayOfEvents
   for (var _p = 0; _p < this.numberOfPhrasesInPart; _p++) {          
    for (var _i = 0; _i < this.arrayOfPhrases[_p].totalNumberOfNotesInPhrase; _i++) {          
       var newEvent = new EventInPart(this.arrayOfPhrases[_p].rhythmicStartingPoints[_i], this.arrayOfPhrases[_p].scaleNotes.allNotes_String[this.arrayOfPhrases[_p].pitches[_i] + this.arrayOfPhrases[_p].scaleNotes.pitch_Classes.length * this.octaveOffset[_p] + this.notesOffset[_p]], 1, this.arrayOfPhrases[_p].rhythmicDurations[_i]);
       this.arrayOfEvents.push(newEvent);
    }
    // TEST
    //console.log('array of events -constructor-: ' + this.arrayOfEvents);
  }

   // PLAY PHRASE
   Tone.Transport.start();
  // this.onPartPlay(this.synth);
  }

  ngOnInit() {
    this.numberOfPhrasesInPart = 1; // at least 1 phrase in part
    this.numberOfPatternsInEachPhrase[0] = 1;
    this.lowerPitchRange = 0;
    this.upperPitchRange = 7;
    this.lowerRhythmRange = 4;
    this.upperRhythmRange = 6;
    this.lowerRhythmRangeMultiplications = 0;
    this.upperRhythmRangeMultiplications = 0;
    // data for phrase 1 
    this.octaveOffset[0] = 2;
    this.notesOffset[0] = 0;
    this.rhythmicOffset[0] = 0;
    this.notesRestsLikelihood[0] = 100;
    this.notesRestsSeed[0] = 1;
    this.numberOfPatternsInEachPhrase[0] = 1;
    // data for phrase 1, pattern 1
    this.numberOfEventsInEachPattern[0][0] = 4;
    this.melodicSeedForEachPattern[0][0] = 1;
    this.rhythmicSeedForEachPattern[0][0] = 1;
  }

  onPartCreate() { 
    // 1_tonic_String                  --> variables not (directly) entered by the user
    // 2_scaleType_String
    // 3_numberOfPatterns,           
    // 4_numberOfEventsInEachPattern,
    // 5_pitchesRanges,
    // 6_rhythmsRanges,
    // 7_melodicSeedForEachPattern
    // 8_rhythmicSeedForEachPattern
    // 9_probIntervals                 --> variables entered directly by the user
    // 10_weightIntervals
    // 11_probPitches
    // 12_weightPitches
    // 13_octaveOffset                 --> variables not (directly) entered by the user
    // 14_notesOffset
    // 15_rhythmicOffset  // 1 -> twice as fast, -1 -> half the speed (within rhythmsRanges)
    // 16_phraseRhythmicStartingPoint // equal to Tone.Time('+0') if first phrase, otherwise equal to duration of previous phrase
                        
      // INITIALISATION OF ARRAY OF PHRASES
      this.arrayOfPhrases = []; // reset arrayOfPhrases
      this.overallFitnessOfPart = 0; // reset fitness
      this.pitchesFitnessOfPart = 0;
      this.intervalsFitnessOfPart = 0;



for (var _i = 0; _i < this.numberOfPhrasesInPart; _i++) {
  var phraseRhythmicStartingPoint;
  // calculate phraseRhythmicStartingPoint -> equal to 0 if first phrase, otherwise equal to duration of previous phrase
  if (_i == 0) {
    phraseRhythmicStartingPoint = 0;
  }
  else if (_i > 0) {
    phraseRhythmicStartingPoint = Tone.Time(this.arrayOfPhrases[_i - 1].entireDurationOfPhrase);
  }

  this.arrayOfPhrases[_i] = new Phrase(
  this.scaleTonic,                                 // 1_tonic_String
  this.scaleType,                                  // 2_scaleType_String
  this.numberOfPatternsInEachPhrase[_i],           // 3_numberOfPatterns
  this.numberOfEventsInEachPattern[_i],            // 4_numberOfEventsInEachPattern
  [this.lowerPitchRange, this.upperPitchRange],    // 5_pitchesRanges
  [this.lowerRhythmRange, this.upperRhythmRange],  // 6_rhythmsRanges   (=>0 , <=8), see rhythmicMatrix inside pattern.ts
  [this.lowerRhythmRangeMultiplications, this.upperRhythmRangeMultiplications],  // 6_rhythmsRanges   (=>0 , <=8), see rhythmicMatrix inside pattern.ts
  this.melodicSeedForEachPattern[_i],              // 7_melodicSeedForEachPattern
  this.rhythmicSeedForEachPattern[_i],             // 8_rhythmicSeedForEachPattern
  this.intervalsFitness,                           // 9_probIntervals
  this.intervalsWeight,                            // 10_weightIntervals
  this.pitchesFitness,                             // 11_probPitches
  this.pitchesWeight,                              // 12_weightPitches
  this.octaveOffset[_i],                               // 13_octaveOffset
  this.notesOffset[_i],                                // 14_notesOffset
  this.rhythmicOffset[_i],                             // 15_rhythmicOffset  // 1 -> twice as fast, -1 -> half the speed (within rhythmsRanges)
  phraseRhythmicStartingPoint,                     // 16_phraseRhythmicStartingPoint // equal to 0 if first phrase, otherwise equal to duration of previous phrase
  this.notesRestsSeed[_i] ,                            // 17_notesrestsSeed
  this.notesRestsLikelihood[_i],                       // 18_notesRestsLikelihood (> 0, < 100)           
  20);                                             // 19 _minimumFitness

  this.pitchesFitnessOfPart += this.arrayOfPhrases[_i].pitchesFitness; 
  this.intervalsFitnessOfPart += this.arrayOfPhrases[_i].intervalsFitness; 
  this.overallFitnessOfPart += this.arrayOfPhrases[_i].overallFitness; 
     }

// console.log('array of phrases' + this.arrayOfPhrases);

   // FILL this.arrayOfEvents
   this.arrayOfEvents = []; // clear arrayOfEvents
   for (var _p = 0; _p < this.numberOfPhrasesInPart; _p++) {          
    for (var _i = 0; _i < this.arrayOfPhrases[_p].totalNumberOfNotesInPhrase; _i++) {                                                                                                                                                                                                                                 // random velocity
       var newEvent = new EventInPart(this.arrayOfPhrases[_p].rhythmicStartingPoints[_i], this.arrayOfPhrases[_p].scaleNotes.allNotes_String[Number(this.arrayOfPhrases[_p].pitches[_i])  + Number((this.arrayOfPhrases[0].scaleNotes.pitch_Classes.length * this.octaveOffset[_p])) + Number(this.notesOffset[_p])],  this.randomChance.floating({ min: 0.4, max: 0.9}), this.arrayOfPhrases[_p].rhythmicDurations[_i]);
       this.arrayOfEvents.push(newEvent);
       // TEST
       //newEvent.note = 'C5';
       //console.log(this.arrayOfEvents);
       //console.log('TEST PITCH as string: ' + ( this.arrayOfPhrases[_p].scaleNotes.allNotes_String[this.arrayOfPhrases[_p].pitches[_i] + (this.arrayOfPhrases[_p].scaleNotes.pitch_Classes.length * this.octaveOffset) + this.notesOffset] ));
       //console.log('TEST PITCH as number: ' + this.arrayOfPhrases[_p].pitches[_i]);
       //console.log('index of notes: ' + (this.arrayOfPhrases[_p].pitches[_i] + (this.arrayOfPhrases[_p].scaleNotes.pitch_Classes.length * this.octaveOffset) + this.notesOffset));
       //console.log('octave offset multiplied: ' + (this.octaveOffset * this.arrayOfPhrases[_p].scaleNotes.pitch_Classes.length));
       //console.log('note offset: ' + this.notesOffset);
       //console.log('pitch class length = ' + this.arrayOfPhrases[_p].scaleNotes.pitch_Classes.length);
       //console.log(this.arrayOfPhrases[_p].scaleNotes.allNotes_String); 
    }
  }
  // TEST
  //console.log('array of events -on part create-: ');
  //console.log(this.arrayOfEvents);

  // MAKE LOOP IN REAL TIME
if (this.part.loop) {
  // (re)CALCULATE this.partLoopEnd and this.partLoopStart
this.partLoopStart = 0;
this.partLoopEnd = this.partLoopStart;
for (var _i = 0; _i < this.numberOfPhrasesInPart; _i++) {
this.partLoopEnd += this.arrayOfPhrases[_i].entireDurationOfPhrase;
}

// when the "generate" button is pressed, if the part is looped, a callback (this.restartPart())
// which stops and re-plays the part is scheduled to be called when the current loop is finished 
var timeLeftUntilLoopEnd = this.partLoopEnd * (1 - this.part.progress);
// console.log("time left until end of loop = " + timeLeftUntilLoopEnd + " seconds");
var timeLeftUntilLoopEndMilliseconds = Math.round(timeLeftUntilLoopEnd * 1000);
console.log("time left until end of loop = " + timeLeftUntilLoopEndMilliseconds + " milliseconds");
setTimeout(()=>{    //<<<---    using ()=> syntax
this.restartPart();
 }, timeLeftUntilLoopEndMilliseconds);
} // end of "if (this.part.loop)"
} // end of "onPartCreate()"

restartPart() {
this.onPartStop();
this.onPartPlay(this.synth);
// TEST
console.log("part restarted");
}

generateAndPlay() {
if (this.part.loop == false) {
this.onPartCreate();
this.onPartPlay(this.synth);
}
if (this.part.loop == true) {
this.onPartCreate();
}
}

  // FUNCTIONS FOR FITNESS GUI  

onPitch0FitnessChange(event){
      this.pitchesFitness[0] = event.target.value;
      console.log("fitness of pitch 0:\n\t" + this.pitchesFitness[0]);
  }
  onPitch1FitnessChange(event){
    this.pitchesFitness[1] = event.target.value;
    console.log("fitness of pitch 1:\n\t" + this.pitchesFitness[1]);
}
onPitch2FitnessChange(event){
  this.pitchesFitness[2] = event.target.value;
  console.log("fitness of pitch 2:\n\t" + this.pitchesFitness[2]);
}
onPitch3FitnessChange(event){
  this.pitchesFitness[3] = event.target.value;
  console.log("fitness of pitch 3:\n\t" + this.pitchesFitness[3]);
}
onPitch4FitnessChange(event){
  this.pitchesFitness[4] = event.target.value;
  console.log("fitness of pitch 4:\n\t" + this.pitchesFitness[4]);
}
onPitch5FitnessChange(event){
  this.pitchesFitness[5] = event.target.value;
  console.log("fitness of pitch 5:\n\t" + this.pitchesFitness[5]);
}
onPitch6FitnessChange(event){
  this.pitchesFitness[6] = event.target.value;
  console.log("fitness of pitch 6:\n\t" + this.pitchesFitness[6]);
}
onPitchesWeightChange(event){
  this.intervalsWeight = event.target.value;
  console.log("weight of intervals fitness:\n\t" + this.intervalsWeight);
}

onInterval0FitnessChange(event){
  this.intervalsFitness[0] = event.target.value;
  console.log("fitness of a 1 step interval:\n\t" + this.intervalsFitness[0]);
}
onInterval1FitnessChange(event){
this.intervalsFitness[1] = event.target.value;
console.log("fitness of a 1 step interval:\n\t" + this.intervalsFitness[1]);
}
onInterval2FitnessChange(event){
this.intervalsFitness[2] = event.target.value;
console.log("fitness of a 1 step interval:\n\t" + this.intervalsFitness[2]);
}
onInterval3FitnessChange(event){
this.intervalsFitness[3] = event.target.value;
console.log("fitness of a 1 step interval:\n\t" + this.intervalsFitness[3]);
}
onInterval4FitnessChange(event){
this.intervalsFitness[4] = event.target.value;
console.log("fitness of a 1 step interval:\n\t" + this.intervalsFitness[4]);
}
onInterval5FitnessChange(event){
this.intervalsFitness[5] = event.target.value;
console.log("fitness of a 1 step interval:\n\t" + this.intervalsFitness[5]);
}
onInterval6FitnessChange(event){
this.intervalsFitness[6] = event.target.value;
console.log("fitness of a 1 step interval:\n\t" + this.intervalsFitness[6]);
}
onIntervalsWeightChange(event){
this.intervalsWeight = event.target.value;
console.log("weight of intervals fitness:\n\t" + this.intervalsWeight);
}

  // OLD GUI FUNCTIONS
  // carrier ADSR
  onAttackChange(event) {
     this.synth.envelope.attack = event.target.value;
    //console.log("attack = " + this.synth.envelope.attack);
  }
  onDecayChange(event) {
    this.synth.envelope.decay = event.target.value;
    //console.log("decay = " + this.synth.envelope.decay);
 }
 onSustainChange(event) {
  this.synth.envelope.sustain = event.target.value;
  //console.log("sustain = " + this.synth.envelope.sustain);
}
onReleaseChange(event) {
  this.synth.envelope.release = event.target.value;
  //console.log("release = " + this.synth.envelope.release);
}

// modulator ADSR
onModulatorAttackChange(event) {
  this.synth.modulationEnvelope.attack = event.target.value;
 //console.log("attack = " + this.synth.envelope.attack);
}
onModulatorDecayChange(event) {
 this.synth.modulationEnvelope.decay = event.target.value;
 //console.log("decay = " + this.synth.envelope.decay);
}
onModulatorSustainChange(event) {
this.synth.modulationEnvelope.sustain = event.target.value;
//console.log("sustain = " + this.synth.envelope.sustain);
}
onModulatorReleaseChange(event) {
this.synth.modulationEnvelope.release = event.target.value;
//console.log("release = " + this.synth.envelope.release);
}

  onWaveformSelected(event) {
    this.synth.oscillator.type = event.target.value;
    console.log("waveform = " + this.synth.oscillator.type);
 }
 onModulatorWaveformSelected(event) {
  this.synth.modulation.type = event.target.value;
  console.log("waveform = " + this.synth.oscillator.type);
}
 onVolumeChange(event) {
   this.synth.volume.value = event.target.value;
   //console.log("volume = " + this.synth.volume.value);
 }
 onPanChange(event) {
  this.panner.pan.value = event.target.value;
  console.log("pan = " + this.panner.pan.value);
}
 onSyncChange(event) {
   if (!this.isSynthSynced) {
     this.isSynthSynced = true;
 this.synth.sync();
 console.log("synced to transport");
   }
else {
  this.isSynthSynced = false;
 this.synth.unsync();
 console.log("unsynced from transport");
}
}
 onMuteChange(event) {
   /*
   if (!this.isSynthMuted) {
     this.isSynthMuted = true;
   this.previousVolume = this.synth.volume.value;
   this.synth.set("volume", -60);
   }
   else {
    this.isSynthMuted = false;
    this.synth.set("volume", this.previousVolume);
   }
   */
  this.synth.volume.mute = !this.synth.volume.mute;
  console.log(this.synth.volume.mute);
 }

 onModulationIndexChange(event) {
  this.synth.modulationIndex.value = event.target.value;
  console.log("modulation index = " + this.synth.modulationIndex.value);
}
onHarmonicityChange(event) {
  this.synth.harmonicity.value = event.target.value;
  console.log("harmonicity = " + this.synth.harmonicity.value);
}

// FUNCTIONS RELATED TO REVERB
onRoomSizeChange(event) {
  this.reverb.roomSize.value = event.target.value;
  console.log("reverb room size = " + this.reverb.roomSize.value);
}

onReverbWetChange(event) {
  this.reverb.wet.value = event.target.value;
  console.log("reverb wet = " + this.reverb.wet.value);
}

// FUNCTIONS RELATED TO DELAY
onDelayTimeSelected(event) {
  this.delay.delayTime.value = event.target.value;
  console.log("delay time = " + this.delay.delayTime.value);
}

onDelayWetChange(event) {
  this.delay.wet.value = event.target.value;
  console.log("delay wet = " + this.delay.wet.value);
}

onDelayFeedbackChange(event) {
  this.delay.feedback.value = event.target.value;
  console.log("delay feedback = " + this.delay.feedback.value);
}

 // FUNCTIONS RELATED TO MUSICAL PART
onPartPlay(synth) {

  //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   this.part.stop();


   this.part = new Tone.Part(function(time, value){
     synth.triggerAttackRelease(value.note, value.duration, "@16n", value.velocity);
   }, this.arrayOfEvents);

  // copying back the settings of the last Part object into the new one
   this.part.loop = this.partLoop;
   this.part.loopStart = this.partLoopStart;
   this.part.loopEnd = this.partLoopEnd;
   this.part.playbackRate = this.partPlayBackRate;
   this.part.probability = this.partProbability;
   this.part.mute = this.partMute;
   this.part.humanize = this.partHumanize;

   // TEST
   //console.log(this.arrayOfEvents);

   this.part.start();
   console.log("part " + this.part.state);
   }

onPartStop() {
      this.part.stop();
      console.log("part " + this.part.state);
    }
onPartClear() {
  this.arrayOfEvents = []; // clear arrayOfEvents
  this.part.removeAll();
     }
// Remove an event from the part. Will recursively iterate into nested parts to find the event.
// https://tonejs.github.io/docs/r12/Part#remove
onRemoveEventAtTime(timeOfEventToBeRemoved) {
  // checking if another event is already present at the same time specified https://www.w3schools.com/jsref/jsref_every.asp
  this.arrayOfEvents = this.arrayOfEvents.filter(function(event){
    return timeOfEventToBeRemoved.value != event.time;  // create a new arrayOfEvents without events with parameter "time" equal to the value submitted in the relative HTML text input
});   

  console.log("removed event at time " + timeOfEventToBeRemoved.value);
  this.part.remove(timeOfEventToBeRemoved.value);
  }
onRemoveEventsAfterTime(timeOfEventToBeRemoved) {
  // recreate the array of events with only events with time property below the time specifiec in the relative HTML input text
  this.arrayOfEvents = this.arrayOfEvents.filter(function(event){
    if (timeOfEventToBeRemoved.value >= event.time) return false;
    });  
  console.log("removed events after time " + timeOfEventToBeRemoved.value);
  this.part.cancel(timeOfEventToBeRemoved.value);
 }

 // FUNCTIONS RELATED TO THE WHOLE PART
 onScaleTonicChange(event) {
  this.scaleTonic = event.target.value;
  console.log('AM SYNTH:\n\tscale tonic:\n\t' + this.scaleTonic);
 }
 onScaleTypeChange(event) {
  this.scaleType = event.target.value;
  console.log('AM SYNTH:\n\tscale type:\n\t' + this.scaleType);
 }

 onLowerPitchRangeChange(event) {
  this.lowerPitchRange = event.target.value;
  console.log('AM SYNTH:\n\tlower pitch range:\n\t' + this.lowerPitchRange);
} 
onUpperPitchRangeChange(event) {
   this.upperPitchRange = event.target.value;
   console.log('AM SYNTH:\n\tupper pitch range:\n\t' + this.upperPitchRange);
 } 
 onLowerRhythmRangeChange(event) {
  this.lowerRhythmRange = event.target.value;
  console.log('AM SYNTH:\n\tlower rhythm range:\n\t' + this.lowerRhythmRange);
} 
onUpperRhythmRangeChange(event) {
  this.upperRhythmRange = event.target.value;
  console.log('AM SYNTH:\n\tupper rhythm range:\n\t' + this.upperRhythmRange);
} 
onLowerRhythmRangeMultiplicationsChange(event) {
  this.lowerRhythmRangeMultiplications = event.target.value;
  console.log('AM SYNTH:\n\tlower rhythm multiplications range:\n\t' + this.lowerRhythmRangeMultiplications);
} 
onUpperRhythmRangeMultiplicationsChange(event) {
  this.upperRhythmRangeMultiplications = event.target.value;
  console.log('AM SYNTH:\n\tupper rhythm multiplications range:\n\t' + this.upperRhythmRangeMultiplications);
} 

onOctaveOffsetChange(event, x) { // x = number of phrase
  this.octaveOffset[x] = event.target.value;
  console.log('AM SYNTH:\n\toctave offset of phrase ' + (x) + ':\n\t' + this.octaveOffset[x]);
} 
onNotesOffsetChange(event, x) {
  this.notesOffset[x] = event.target.value;
  console.log('AM SYNTH:\n\tnotes offset of phrase ' + (x) + ':\n\t' + this.notesOffset[x]);
} 
onRhythmicOffsetChange(event, x) {
  this.rhythmicOffset[x] = event.target.value;
  console.log('AM SYNTH:\n\trhythmic offset of phrase ' + (x) + ':\n\t' + this.rhythmicOffset[x]);
} 

onNotesRestsLikelihoodChange(event, x) {
  this.notesRestsLikelihood[x] = event.target.value;
  console.log('AM SYNTH:\n\tnotes/rests likelihood of phrase' + (x) + ':\n\t' + this.notesRestsLikelihood[x]);
} 
onNotesRestsSeedChange(event, x) {
  this.notesRestsSeed[x] = event.target.value;
  console.log('AM SYNTH:\n\tnotes/rests seed of phrase' + (x) + ':\n\t' + this.notesRestsSeed[x]);
} 

copyPhraseInPhrase(event, x) {
  //console.log("copying phrase " + event.target.value + " into phrase " + x);
  this.octaveOffset[x] = this.octaveOffset[event.target.value - 1 ];
  this.notesOffset[x] = this.notesOffset[event.target.value - 1];
  this.rhythmicOffset[x] = this.rhythmicOffset[event.target.value - 1];
  this.notesRestsLikelihood[x] = this.notesRestsLikelihood[event.target.value - 1];
  this.notesRestsSeed[x] = this.notesRestsSeed[event.target.value - 1];
  this.numberOfPatternsInEachPhrase[x] = this.numberOfPatternsInEachPhrase[event.target.value - 1];

  for (var _i = 0; _i < this.numberOfPatternsInEachPhrase[x]; _i++ ) {
    this.numberOfEventsInEachPattern[x] = this.numberOfEventsInEachPattern[event.target.value -1];
    this.rhythmicSeedForEachPattern[x][_i] = this.rhythmicSeedForEachPattern[event.target.value - 1][_i];
    this.melodicSeedForEachPattern[x][_i] = this.melodicSeedForEachPattern[event.target.value - 1][_i];
  }
  }

  scramblePhrase(x) {
    this.octaveOffset[x] = this.randomChance.weighted([0, 1, 2, 3, 4], [2, 3, 4, 2, 2]);
    this.notesOffset[x] = this.randomChance.weighted([-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5], [2, 3, 4, 5, 6, 10, 6, 5, 4, 3, 2]);
    this.rhythmicOffset[x] = this.randomChance.weighted([-2, -1, 0, 1, 2], [1, 2, 8, 2, 1]);
    this.notesRestsLikelihood[x] = this.randomChance.natural({ min: 30, max: 90 });
    this.notesRestsSeed[x] = this.randomChance.integer({ min: -200, max: 299 });
    this.numberOfPatternsInEachPhrase[x] = this.randomChance.weighted([1, 2, 3, 4, 5, 6, 7, 8], [1, 2, 3, 4, 3, 2, 1, 1]);

    for (var _i = 0; _i < this.numberOfPatternsInEachPhrase[x]; _i++ ) {
      this.numberOfEventsInEachPattern[x][_i] = this.randomChance.weighted([1, 2, 3, 4, 5, 6, 7, 8], [1, 2, 3, 4, 3, 2, 1, 1]);
      this.melodicSeedForEachPattern[x][_i] = this.randomChance.integer({ min: -200, max: 299 });
      this.rhythmicSeedForEachPattern[x][_i] = this.randomChance.integer({ min: -200, max: 200 });
    }
  }

  copyPatternInPattern(event, x, p) {
    this.numberOfEventsInEachPattern[x][p]   = this.numberOfEventsInEachPattern[x][event.target.value - 1];
    this.rhythmicSeedForEachPattern[x][p] = this.rhythmicSeedForEachPattern[x][event.target.value - 1];
    this.melodicSeedForEachPattern[x][p] = this.melodicSeedForEachPattern[x][event.target.value - 1];
 }

 scramblePattern(x, p){
  for (var _i = 0; _i < this.numberOfPatternsInEachPhrase[x]; _i++ ) {
    this.numberOfEventsInEachPattern[x][p] = this.randomChance.natural({ min: 2, max: 8 });
    this.melodicSeedForEachPattern[x][p] = this.randomChance.integer({ min: -200, max: 299 });
    this.rhythmicSeedForEachPattern[x][p] = this.randomChance.integer({ min: -200, max: 200 });
  }
}
  scrambleNumberOfEventsPattern(x, p){
    for (var _i = 0; _i < this.numberOfPatternsInEachPhrase[x]; _i++ ) {
      this.numberOfEventsInEachPattern[x][p] = this.randomChance.natural({ min: 2, max: 8 });
    }
  }
  scrambleMelodicSeedForPattern(x, p){
    for (var _i = 0; _i < this.numberOfPatternsInEachPhrase[x]; _i++ ) {
      this.melodicSeedForEachPattern[x][p] = this.randomChance.integer({ min: -200, max: 299 });
    }
  }
  scrambleRhythmicSeedForPattern(x, p){
    for (var _i = 0; _i < this.numberOfPatternsInEachPhrase[x]; _i++ ) {
      this.rhythmicSeedForEachPattern[x][p] = this.randomChance.integer({ min: -200, max: 200 });
    }
  }


 onNumberOfPhrasesInPartChange(event) {
  this.numberOfPhrasesInPart = event.target.value;
  console.log('AM SYNTH:\n\tnumber of phrases in part:\n\t' + this.numberOfPhrasesInPart);
 }
 onNumberOfPatternsInEachPhraseChange(event, x) {
  this.numberOfPatternsInEachPhrase[x] = event.target.value;
  console.log('AM SYNTH:\n\tnumber of patterns in phrase ' + (x+1) + ' :\n\t' + this.numberOfPatternsInEachPhrase[x]);
 }

 onNumberOfEventsInEachPatternChange(event, x, p) {  // x = phrase, p = pattern
   this.numberOfEventsInEachPattern[x][p] = event.target.value;
  console.log('AM SYNTH:\n\tnumber of events in pattern ' + (p+1) + ' , phrase ' + (x+1) + ' :\n\t' + this.numberOfEventsInEachPattern[x][p]);
 }

 onMelodicSeedForEachPatternChange(event, x, p) {  // x = phrase, p = pattern
  this.melodicSeedForEachPattern[x][p] = event.target.value;
 console.log('AM SYNTH:\n\tmelodic seed of pattern ' + (p+1) + ' , phrase ' + (x+1) + ' :\n\t' + this.melodicSeedForEachPattern[x][p]);
}

onRhythmicSeedForEachPatternChange(event, x, p) {  // x = phrase, p = pattern
  this.rhythmicSeedForEachPattern[x][p] = event.target.value;
 console.log('AM SYNTH:\n\trhythmic seed of pattern ' + (p+1) + ' , phrase ' + (x+1) + ' :\n\t' + this.rhythmicSeedForEachPattern[x][p]);
}

 onPartPlayBackRateChange(event) {
  this.part.playbackRate = event.target.value;
  this.partPlayBackRate = event.target.value;
 }
 onPartProbabilityChange(event) {
  this.part.probability = event.target.value;
  this.partProbability = event.target.value;
 }
 onPartLoopCheckBoxChanged(event) {
  this.part.loop = event.target.checked;
  this.partLoop = event.target.checked;
  if (this.part.loop == true) {
    // CALCULATE this.partLoopEnd and this.partLoopStart
  this.partLoopStart = 0;
  this.partLoopEnd = this.partLoopStart;
  for (var _i = 0; _i < this.numberOfPhrasesInPart; _i++) {
   this.partLoopEnd += this.arrayOfPhrases[_i].entireDurationOfPhrase;
     }
  }
  console.log("part loop = " + this.part.loop);
 }
 onPartMuteChanged(event) {
  this.part.mute = event.target.checked;
  this.partMute = event.target.checked;
  console.log("part mute = " + this.part.mute);
 }
onAddEventClicked(atTime,note,velocity,duration,synth) {
  var newEvent = new EventInPart(Tone.Time(atTime.value), note.value, velocity.value, Tone.Time(duration.value)); 
    // checking if another event is already present at the same time specified https://www.w3schools.com/jsref/jsref_every.asp
  let checkForEventAtSameTime = this.arrayOfEvents.every(function(event){
       return event.time != atTime.value;
  });   // checkForEventAtSameTime is a boolean variable
  if (!checkForEventAtSameTime) {  // if an event IS already present at the time specified
    console.log("event has not been added since another event is already present at the same start time");
  }
  else {   // if an event IS NOT already present at the time specified
      // add element to an array https://stackoverflow.com/questions/6254050/how-to-add-an-object-to-an-array
    this.arrayOfEvents.push(newEvent);
  }
  // TO DO: IMPLEMENT PART AUTO-UPDATING WHEN ADDING NEW EVENTS -> schedule a part.stop() and a part.start() when this.part.progress reaches 1
}
onPartHumanizeCheckBoxChanged(event) {
  this.part.humanize = event.target.checked;
  this.partHumanize = event.target.checked;
  console.log("humanize = " + this.part.humanize);
}
}  // end of SynthComponent class








 // constructor of type Event (used to create notes to be aaded/removed to/from a part)
 function EventInPart(_time, _note, _velocity, _duration) {
  this.time = _time;
  this.note = _note;
  this.velocity = _velocity;
  this.duration = _duration;
 }
 type Event = {
  time: number;
  name: string;
}