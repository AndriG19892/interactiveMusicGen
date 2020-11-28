import { Pattern } from "./pattern";
import { scalePitches } from './scalePitches';
import Tone from 'tone';
import Chance from 'chance';

import { temporaryAllocator } from "@angular/compiler/src/render3/view/util";
import { TNode } from "@angular/core/src/render3/interfaces/node";

export class Phrase {
    // VARIABLES
    // needed in constructor
   tonic_String: string;                         // 1
   scaleType_String: string;                     // 2
   numberOfPatterns: number;                     // 3     NOT user entered parameters
   numberOfEventsInEachPattern : number[] = [];  // 4
   pitchesRanges : number[] = [];                // 5
   rhythmsRanges : number[] = [];                // 6
   rhythmsMultiplicationsRanges : number[] = [];                // 6
   melodicSeedForEachPattern : number[] = [];    // 7
   rhythmicSeedForEachPattern : number[] = [];   // 8
   probIntervals : number[] = [];                // 9     user entered parameters
   weightIntervals : number;                     // 10
   probPitches : number[] = [];                  // 11
   weightPitches : number;                       // 12

   // other variables
   patterns : Pattern[] = [];
   pitches : number[] = [];   // all the pitches (regardless of scale grades) in all the patterns in this phrase
   pitchesInScale : number[] = []; // all the pitches (accounting of scale grades) in all the patterns in this phrase
   pitchesFitness: number;
   intervals : number[] = []; // all the intervals in all the patterns in this phrase
   intervalsFitness: number;
   scaleNotes: scalePitches;

   rhythmicDurations : string[] = [];        // also present in pattern.ts
   rhythmicDurationsString : string[] = [];  // also present in pattern.ts
   rhythmicStartingPoints : string[] = [];   // also present in pattern.ts
   phraseRhythmicStartingPoint : Tone.Time;
   entireDurationOfPhrase : Tone.Time;
   entireDurationOfPhraseMusicalNotation : string;
   octaveOffset: number;
   notesOffset: number;
   rhythmicOffset: number;
   overallFitness: number;

   minimumFitness : number;


   totalNumberOfEventsInPhrase: number;
   totalNumberOfNotesInPhrase: number;
   totalNumberOfRestsInPhrase: number;
   areEventsNotesOrRests: boolean[] =[];  // true = note, false = rest. Contains totalNumberOfEventsInPhrase elements
   notesRestsSeed : number;
   notesRestsChance : any;
   notesRestsLikelihood : number;

   // FUNCTIONS
   constructor(_tonic_String: string,                   // 1
              _scaleType_String: string,                // 2
              _numberOfPatterns: number,                // 3
              _numberOfEventsInEachPattern: number[],   // 4
              _pitchesRanges: number[],                 // 5
              _rhythmsRanges: number[],                 // 6
              _rhythmsMultiplicationsRanges: number[],                 // 6
              _melodicSeedForEachPattern: number[],     // 7
              _rhythmicSeedForEachPattern: number[],    // 8
              _probIntervals: number[],                 // 9
              _weightIntervals : number,                // 10
              _probPitches : number[] = [],             // 11
              _weightPitches : number,                  // 12
              _octaveOffset: number,                    // 13
              _notesOffset: number,                     // 14
              _rhythmicOffset: number,                  // 15
              _phraseRhythmicStartingPoint : Tone.Time, // 16
              _notesRestsSeed : number,                 // 17
              _notesRestsLikelihood : number,           // 18
              _minimumFitness : number){                // 19  

    // the constructor initialises the variables of this class with the data provided to it
    this.minimumFitness = _minimumFitness;
    this.tonic_String = _tonic_String;
    this.scaleType_String = _scaleType_String;
    this.numberOfPatterns = _numberOfPatterns;
    this.weightIntervals = _weightIntervals;
    this.weightPitches = _weightPitches;
    this.octaveOffset = _octaveOffset; 
    this.notesOffset = _notesOffset;
    this.rhythmicOffset = _rhythmicOffset;
    this.phraseRhythmicStartingPoint = _phraseRhythmicStartingPoint;
    // loop through numberOfPatterns
    for (var _i = 0; _i < this.numberOfPatterns; _i++) {
    this.numberOfEventsInEachPattern[_i] = _numberOfEventsInEachPattern[_i];
    this.melodicSeedForEachPattern[_i] = _melodicSeedForEachPattern[_i];
    this.rhythmicSeedForEachPattern[_i] = _rhythmicSeedForEachPattern[_i];
    } // end of for loop through numberOfPatterns

    this.notesRestsSeed = _notesRestsSeed;
    this.notesRestsLikelihood = _notesRestsLikelihood;

    // array for pitches and rhythms ranges have only 2 items each
    for (var _x = 0; _x < 2; _x++) {
      this.pitchesRanges[_x] = _pitchesRanges[_x];
      this.rhythmsRanges[_x] = _rhythmsRanges[_x];
      this.rhythmsMultiplicationsRanges[_x] = _rhythmsMultiplicationsRanges[_x];
    }

    // populate array for intervals probabilities.
    // its length depends on the amount of probabilities provided by the user
    // In order to adapt the system to any number of notes in scale, the intervals
    // and their probabilities are not fixed, and refer to the scale steps of a specific scale
    // e.g. 0 = unison always, 3 = fourth up in a seven notes scale
    // 3 = fifth up in a 5 notes scale
    for (var _i = 0; _i < _probIntervals.length; _i++) {
        this.probIntervals[_i] = _probIntervals[_i];
    }
    for (var _i = 0; _i < _probPitches.length; _i++) {
      this.probPitches[_i] = _probPitches[_i];
  }

    this.scaleNotes = new scalePitches(this.tonic_String, this.scaleType_String);
    // functions' calls
    this.populateMelodicPhrase();

    this.populatePitches();   // REDO      // CHANGE NAME AND CREATE ANOTHER FUNCTION TO BE
    //this.populateIntervals(); // REDO                   // PERFORMED AFTER applyRests()
    this.populateRhythmicPhrase();
    this.populateRhythmicStartingPoints();
    this.calculateEntireDurationOfPhrase();

    this.populatePitchesInScale(); 

    // RESTS IMPLEMENTATION
    this.populateTotalNumberOfEventsInPhrase();
    this.populateAreEventsNotesOrRests();
    this.populateTotalNumberOfNotesInPhrase();

    this.applyRests();   // eliminates notes where rests have to be
    this.populateIntervalsWithRests();  // re-populate intervals

    this.evaluatePitchesFitness(); 
    this.evaluateIntervalsFitness();  
    this.evaluateOverallFitness();  
    
    this.calculateEntireDurationOfPhraseMusicalNotation();
    this.printPhraseInformation();
}

calculateEntireDurationOfPhraseMusicalNotation() {
this.entireDurationOfPhraseMusicalNotation = Tone.Time(this.entireDurationOfPhrase).toNotation();
}

printPhraseInformation() {
  //console.log('PHRASE\n');
  //console.log('Pitches in this phrase;\n\t'+ this.pitches);
  //console.log('Intervals in this phrase:\n\t' + this.intervals);
  //console.log('Rhythmic durations of each event in phrase:\n\t ' + this.rhythmicDurationsString);
  //console.log('Are events notes / rests:\n\t' + this.areEventsNotesOrRests);
  //console.log('Entire duration of phrase:\n\t' + this.entireDurationOfPhrase);
  console.log('Intervals fitness (weight = ' + this.weightIntervals +'):\n\t' + this.intervalsFitness);
  console.log('Pitch fitness (weight = ' + this.weightPitches +'):\n\t' + this.pitchesFitness);
  console.log('Overal fitness:\n\t' + this.overallFitness);
}

   //Rests implementation, 09/03/2019

  evaluateIntervalsFitness() {
    this.intervalsFitness = 0;
    if (this.intervals.length > 0) {
    for (var _i = 0; _i < this.intervals.length; _i++) {
      // do not check for the intervals which have not been supplied by the user
       // e.g. if the user specifies the probabilities for 3 intervals (unison, second and third),
       // intervals other than those do not affect the fitness in any way
       if (Math.abs(this.intervals[_i]) < (this.probIntervals.length)) {
    this.intervalsFitness += this.probIntervals[Math.abs(this.intervals[_i])];
     }
    }
   }
   this.intervalsFitness = this.intervalsFitness * this.weightIntervals;
  }

   populateIntervalsWithRests() {
     // if there is at least 1 interval in phrase 
     if (this.totalNumberOfNotesInPhrase > 1) { 
     for (var _i = 0; _i < this.totalNumberOfNotesInPhrase - 1; _i++) {
       this.intervals[_i] = this.pitches[_i+1] - this.pitches[_i];
     }
    }
    }

   applyRests() {
     // the backward counting is to avoid problems when removing items from arrays
    for (var _i = this.totalNumberOfEventsInPhrase - 1; _i >= 0; _i--) { // for each event in phrase
      if (this.areEventsNotesOrRests[_i] == false) {  // if that event should be a rest rather than a note
     this.rhythmicStartingPoints.splice(_i,1);   // eliminate note
     this.pitches.splice(_i,1);
     this.rhythmicDurations.splice(_i,1);
      }
    }
   }

   populateTotalNumberOfEventsInPhrase() {
     this.totalNumberOfEventsInPhrase = 0;
     for (var _i = 0; _i < this.numberOfPatterns; _i++) {
     this.totalNumberOfEventsInPhrase += this.numberOfEventsInEachPattern[_i];
     }
     // TEST
     //console.log('Total number of events in phrase:\n\t' + this.totalNumberOfEventsInPhrase); 
   }

   populateAreEventsNotesOrRests() {
    this.notesRestsChance = new Chance(this.notesRestsSeed);
    for (var _i = 0; _i < this.totalNumberOfEventsInPhrase; _i++) {
      this.areEventsNotesOrRests[_i] = this.notesRestsChance.bool({ likelihood: this.notesRestsLikelihood });
      }
  }

  populateTotalNumberOfNotesInPhrase() {
    this.totalNumberOfNotesInPhrase = 0;
    for (var _i = 0; _i < this.totalNumberOfEventsInPhrase; _i++) {
      if (this.areEventsNotesOrRests[_i] == true) {
      this.totalNumberOfNotesInPhrase += 1;
      }
    }
     // console.log('Number of notes in phrase:\n\t' + this.totalNumberOfNotesInPhrase);
    }

  populateTotalNumberOfRestsInPhrase() {
     
  }
   
   //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

   populateMelodicPhrase() {
       for (var _i = 0; _i < this.numberOfPatterns; _i++) {
         this.patterns[_i] = new Pattern(this.numberOfEventsInEachPattern[_i], this.pitchesRanges, this.melodicSeedForEachPattern[_i], this.rhythmicSeedForEachPattern[_i], this.probIntervals, this.rhythmsRanges, this.rhythmsMultiplicationsRanges, this.rhythmicOffset);
       }
   }

   populatePitches() {
    for (var _i = 0; _i < this.numberOfPatterns; _i++) {
      this.pitches = this.pitches.concat(this.patterns[_i].pitches);
    }
   }
   
   populateIntervals() {
   var iterator = 0; // used for indexind this.pitches
    for (var _i = 0; _i < this.numberOfPatterns; _i++) {
      // for each pattern in this phrase
      // check whether the pattern has an interval (has more than 2 pitches)
      // if yes, add its intervals to the phrase's intervals
      if (this.patterns[_i].melodicIntervals.length > 0) {
      this.intervals = this.intervals.concat(this.patterns[_i].melodicIntervals);
      }
    // add intervals between patterns
    iterator += this.numberOfEventsInEachPattern[_i];
    this.intervals = this.intervals.concat(this.pitches[iterator] - this.pitches[iterator-1]);
     }
    // remove last interval (unwanted Null item)
    this.intervals.splice(this.intervals.length-1);
    //console.log('Intervals in this phrase; ' + this.intervals);
   }

   populateRhythmicPhrase() {
     // populate array of rhythmic durations
      for (var _i = 0; _i < this.numberOfPatterns; _i++) {
      for (var _y = 0; _y < this.numberOfEventsInEachPattern[_i]; _y++) {
      this.rhythmicDurations.push(this.patterns[_i].rhythmicDurations[_y]);
      this.rhythmicDurationsString.push(this.patterns[_i].rhythmicDurationsString[_y]);
    }
  }
   }

   populateRhythmicStartingPoints() {
    for (var _i = 0; _i < this.pitches.length; _i++) {
      if (_i == 0) {       // starting point of first event
      this.rhythmicStartingPoints[0] = Tone.Time(this.phraseRhythmicStartingPoint) + Tone.Time('0');
      }
      else if (_i > 0) {
        for (var _b = 0; _b < _i; _b++) {
          if (_b == 0) {
            this.rhythmicStartingPoints[_i] = Tone.Time(this.rhythmicDurations[_b]) + Tone.Time(this.phraseRhythmicStartingPoint);
          }
          else {
          this.rhythmicStartingPoints[_i] = Tone.Time(this.rhythmicStartingPoints[_i]) + Tone.Time(this.rhythmicDurations[_b]);
          }
        }
      }
    }
   }

   printRhythmicStartingPoints() {
    //console.log('Rhythmic starting points in this phrase:\n\t' + this.rhythmicStartingPoints);
   }

   calculateEntireDurationOfPhrase(){
     // the entire duration of the phrase is equal to the starting point of the last event + the duration of the last event
    this.entireDurationOfPhrase = Tone.Time(this.rhythmicStartingPoints[this.rhythmicStartingPoints.length - 1]) + Tone.Time(this.rhythmicDurations[this.rhythmicDurations.length - 1]);
  }

  populatePitchesInScale() {
    // create a temporary array as big as the notes contained in one octave of this scale
    let array_Scale_Keys = new Array<number>(this.scaleNotes.pitch_Classes.length);
    for (let _i = 0; _i<this.scaleNotes.pitch_Classes.length; _i++) {
     array_Scale_Keys[_i] = _i+1;
    }
    // copy array in itself 3 trimes
    array_Scale_Keys = array_Scale_Keys.concat(array_Scale_Keys);
    array_Scale_Keys = array_Scale_Keys.concat(array_Scale_Keys);

    for(var _i = 0; _i < this.pitches.length; _i++) {
      this.pitchesInScale[_i] = array_Scale_Keys[this.pitches[_i] + (this.scaleNotes.pitch_Classes.length*2)];
    }
    //console.log('Pitches in scale:\n\t' + this.pitchesInScale);
  }

  evaluatePitchesFitness() {
    this.pitchesFitness = 0;
    for (var _i = 0; _i < this.pitches.length; _i++) {
      if (this.pitchesInScale[_i] <= (this.probPitches.length)) {
        this.pitchesFitness += this.probPitches[this.pitchesInScale[_i]-1]; // - 1 converts from scale grade to index of array this.probPitches
      }
    }
    this.pitchesFitness = this.pitchesFitness * this.weightPitches;
  }

  evaluateOverallFitness() {
    this.overallFitness = this.pitchesFitness + this.intervalsFitness;
    //console.log('Overall fitness of this phrase:\n\t ' + this.overallFitness);
  }

   // end of "phrase" class
}