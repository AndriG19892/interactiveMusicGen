// IMPORT CHANCE.JS
import Chance from 'chance';
import Tone from 'tone';

export class Pattern {
    // VARIABLES
   numberOfEvents: number;
   pitchesRange : number[] = [];                  // array of 2 items, lower and upper ranges from tonic, where tonic = 0;
   melodicSeed: number;
   rhythmicSeed: number;
   pitches : number[] = []; 

   rhythmicDurations : string[] = [];             // also present in phrase.ts
   rhythmicDurationsString : string[] = [];       // also present in phrase.ts

   relativeRhythmicSubdivisionsMultiplications : number[] = [];  //  steps (intervals) for indeces of absoluteRhythmicSubdivisions

   relativeRhythmicSubdivisions : number[] = [];  //  steps (intervals) for indeces of absoluteRhythmicSubdivisions
   absoluteRhythmicSubdivisions : number[] = [0,1,2,3,4,5,6,7,8];
   rhythmicSubdivisions : number[] = [];          //  vertical indeces for rhythmicMatrix
   rhythmicMultiplications : number[] = [];       //  horizontal indeces for rhythmicMatrix
   variationForRhythmicNormalDistribution : number;
   variationForRhythmicNormalDistributionMultiplications : number;

   rhythmsRange : number[] = []; 
   rhythmsMultiplicationsRange : number[] = []; 
   melodicChance : any;
   rhythmicChance : any;
   rhythmicMatrix : string[][] = /*0*/ [[Tone.Time('1n')*4,Tone.Time('1n')*12,Tone.Time('1n')*20,Tone.Time('1n')*28],                                 // 2^2 level
                                 /*1*/ [Tone.Time('1n')*2,Tone.Time('1n')*6,Tone.Time('1n')*10,Tone.Time('1n')*14],                                   // 2^1 level
                                 /*2*/ [Tone.Time('1n'),Tone.Time('1n')*3,Tone.Time('1n')*5,Tone.Time('1n')*7],                                       // 2^0 level
                                 /*3*/ [Tone.Time('2n'),Tone.Time('1n.'),Tone.Time('1n')+Tone.Time('4n'),Tone.Time('2n')*7],                          // 2^-1 level
                                 /*4*/ [Tone.Time('4n'),Tone.Time('2n.'),Tone.Time('1n')+Tone.Time('4n'),Tone.Time('1n')+Tone.Time('2n')],            // 2^-2 level
                                 /*5*/ [Tone.Time('8n'), Tone.Time('4n.'),Tone.Time('2n')+Tone.Time('8n'),Tone.Time('1n')+Tone.Time('4n.')],          // 2^-3 level
                                 /*6*/ [Tone.Time('16n'),Tone.Time('8n.'),Tone.Time('4n')+Tone.Time('16n'),Tone.Time('4n')+Tone.Time('8n.')],         // 2^-4 level
                                 /*7*/ [Tone.Time('32n'),Tone.Time('16n.'),Tone.Time('8n')+Tone.Time('32n'),Tone.Time('8n')+Tone.Time('16n.')],       // 2^-5 level
                                 /*8*/ [Tone.Time('64n'),Tone.Time('32n.'),Tone.Time('16n')+Tone.Time('64n'),Tone.Time('16n')+Tone.Time('32n.')]];    // 2^-6 level
                      //                    4                  3                          5                                 7

rhythmicMatrixString : string[][] =  /*0*/ [['1n*4', '(1n*4)*3', '(1n*4)5', '(1n*4)*7'],  // 2^2 level
                                     /*1*/ ['1n*2', '(1n*2)*3', '(1n*2)5', '(1n*2)*7'],  // 2^1 level
                                     /*2*/ ['1n', '1n*3', '1n*5', '1n*7'],               // 2^0 level
                                     /*3*/ ['2n', '1n.', '1n+4n', '2n*7'],                // 2^-1 level
                                     /*4*/ ['4n','2n.','1n+4n','1n+2n'],                 // 2^-2 level
                                     /*5*/ ['8n', '4n.', '2n+8n', '1n+4n.'],             // 2^-3 level
                                     /*6*/ ['16n', '8n.', '4n+16n', '4n+8n.'],           // 2^-4 level
                                     /*7*/ ['32n', '16n.', '8n+32n', '8n+16n.'],         // 2^-5 level
                                     /*8*/ ['64n', '32n.', '16n+64n', '16n+32n.']];      // 2^-6 level
                      //                      4      3         5          7

   melodicIntervals : number[] = [];
   probIntervals: number[] = [];
   rhythmicOffset: number;

   // FUNCTIONS
   constructor(_numberOfEvents: number,
               _pitchesRange: number[],
               _melodicSeed: number,
               _rhythmicSeed: number,
               _probIntervals: number[],
               _rhythmsRange: number[],
               _rhythmsMultiplicationsRange: number[],
               _rhythmicOffset: number
               ){
    this.numberOfEvents = _numberOfEvents;
    for (var _i = 0; _i < 2; _i++) {
      this.pitchesRange[_i] = _pitchesRange[_i]; 
      this.rhythmsRange[_i] = _rhythmsRange[_i];
      this.rhythmsMultiplicationsRange[_i] = _rhythmsMultiplicationsRange[_i];
    }
      this.melodicSeed = _melodicSeed;
      this.melodicChance = new Chance(this.melodicSeed);
      this.rhythmicSeed = _rhythmicSeed;
      this.rhythmicChance = new Chance(this.rhythmicSeed);
      this.rhythmicOffset = _rhythmicOffset;
    // populate array for intervals probabilities.
    // see phrase for explanations on probIntervals
    for (var _i = 0; _i < _probIntervals.length; _i++) {
      this.probIntervals[_i] = _probIntervals[_i];
  }
    this.populateMelodicPattern();     // generate pitches
    this.evaluateMelodicIntervals();
    this.populateRhythmicPattern();
    this.printPatternInformation();    // TEST print pattern data
    this.populateRhythmicSubdivisions();
}

   populateMelodicPattern() {
       for (var _i = 0; _i < this.numberOfEvents; _i++) {
         this.pitches[_i] = this.melodicChance.integer({ min: this.pitchesRange[0], max: this.pitchesRange[1] });
        }
   }

   evaluateMelodicIntervals() {
    for (var _i = 0; _i < this.numberOfEvents - 1; _i++) {
    this.melodicIntervals[_i] = this.pitches[_i+1] - this.pitches[_i]
    }
  }

   populateRhythmicPattern() {
    // create this.numberOfEvents number of VERTICAL INDECES for accessing rhythmicMatrix
    this.populateRhythmicSubdivisions(); 
    // create this.numberOfEvents number of HORIZONTAL INDECES for accessing rhythmicMatrix
    this.populateRhythmicMultiplications(); 

    for (var _i = 0; _i < this.numberOfEvents; _i++) {
      this.rhythmicDurations[_i] = this.rhythmicMatrix[this.rhythmicSubdivisions[_i]][this.rhythmicMultiplications[_i]];
      this.rhythmicDurationsString[_i] = this.rhythmicMatrixString[this.rhythmicSubdivisions[_i]][this.rhythmicMultiplications[_i]];
    }
    // TEST print rhythmic durations
    // console.log('RHYTHMIC DURATIONS IN PATTERN = ' + this.rhythmicDurations);
    // pattern.ts has not rhythmic starting points wince they depend on where the pattern is located inside the parent
    // which is phrase.ts. 
   }

   populateRhythmicSubdivisions() {  // CALLED INSIDE this.populateRhythmicPattern()
     // choose first duration randomly between rhythms ranges (ALWAYS AT LEAST 1 EVENT IN ANY PATTERN)
     this.rhythmicSubdivisions[0] = Number(this.rhythmicChance.natural({ min: Number(this.rhythmsRange[0]), 
                                                                  max: Number(this.rhythmsRange[1]) }) );

     if (this.numberOfEvents > 1) { // since if we e.g. have 5 events, the steps (relative) will be 4 (this.numberOfEvents - 1)
     // create a variation for chance.normal, which is half the difference between the range(s)
     this.variationForRhythmicNormalDistribution = Math.round((Number(this.rhythmsRange[1]) - Number(this.rhythmsRange[0])) / 2);

      for (var _i = 0; _i < this.numberOfEvents - 1; _i++) {  
        this.relativeRhythmicSubdivisions[_i] = Number(this.rhythmicChance.normal({mean:0, var:this.variationForRhythmicNormalDistribution}));
        
        if (this.relativeRhythmicSubdivisions[_i] > this.variationForRhythmicNormalDistribution) {
          this.relativeRhythmicSubdivisions[_i] = this.variationForRhythmicNormalDistribution;
        }
        else if (this.relativeRhythmicSubdivisions[_i] < this.variationForRhythmicNormalDistribution) {
          this.relativeRhythmicSubdivisions[_i] = this.variationForRhythmicNormalDistribution * - 1;
        }  
        this.rhythmicSubdivisions[_i+1] = this.rhythmicSubdivisions[_i] + this.relativeRhythmicSubdivisions[_i];
        // make rhythmic subdivisions between user-supplied rhythm ranges
        if (this.rhythmicSubdivisions[_i+1] > Number(this.rhythmsRange[1])) {
          this.rhythmicSubdivisions[_i+1] = Number(this.rhythmsRange[1]);
        }
        else if (this.rhythmicSubdivisions[_i+1] < Number(this.rhythmsRange[0])) {
          this.rhythmicSubdivisions[_i+1] = Number(this.rhythmsRange[0]);
        }  
     }
    } 
      // add rhythmic offset
      // make rhythmic subdivisions between maximum(8) and minimum(0) rhythm ranges
      for (var _i = 0; _i < this.numberOfEvents; _i++) {  
        this.rhythmicSubdivisions[_i] = this.rhythmicSubdivisions[_i] + Number(this.rhythmicOffset);
          if (this.rhythmicSubdivisions[_i] > 8) {
          this.rhythmicSubdivisions[_i] = 8;
        }
        else if (this.rhythmicSubdivisions[_i] < 0) {
          this.rhythmicSubdivisions[_i] = 0;
        }
     } 
     // TEST
     // console.log('RHYTHMIC SUBDIVISIONS OF PATTERN: ' + this.rhythmicSubdivisions);
    }

    populateRhythmicMultiplications() {  // CALLED INSIDE this.populateRhythmicPattern()
      // choose first duration randomly between rhythms ranges (ALWAYS AT LEAST 1 EVENT IN ANY PATTERN)
      this.rhythmicMultiplications[0] = Number(this.rhythmicChance.natural({ min: Number(this.rhythmsMultiplicationsRange[0]), 
                                                                   max: Number(this.rhythmsMultiplicationsRange[1]) }) );
 
      if (this.numberOfEvents > 1) { // since if we e.g. have 5 events, the steps (relative) will be 4 (this.numberOfEvents - 1)
      // create a variation for chance.normal, which is half the difference between the range(s)
      this.variationForRhythmicNormalDistributionMultiplications = Math.round((Number(this.rhythmsMultiplicationsRange[1]) - Number(this.rhythmsMultiplicationsRange[0])) / 2);
      
       for (var _i = 0; _i < this.numberOfEvents - 1; _i++) {  
         this.relativeRhythmicSubdivisionsMultiplications[_i] = Number(this.rhythmicChance.normal({mean:0, var:this.variationForRhythmicNormalDistributionMultiplications}));
         
         if (this.relativeRhythmicSubdivisionsMultiplications[_i] > this.variationForRhythmicNormalDistributionMultiplications) {
           this.relativeRhythmicSubdivisionsMultiplications[_i] = this.variationForRhythmicNormalDistributionMultiplications;
         }
         else if (this.relativeRhythmicSubdivisionsMultiplications[_i] < this.variationForRhythmicNormalDistributionMultiplications) {
           this.relativeRhythmicSubdivisionsMultiplications[_i] = this.variationForRhythmicNormalDistributionMultiplications * - 1;
         }  
         this.rhythmicMultiplications[_i+1] = this.rhythmicMultiplications[_i] + this.relativeRhythmicSubdivisionsMultiplications[_i];
         // make rhythmic subdivisions between user-supplied rhythm ranges
         if (this.rhythmicMultiplications[_i+1] > Number(this.rhythmsMultiplicationsRange[1])) {
           this.rhythmicMultiplications[_i+1] = Number(this.rhythmsMultiplicationsRange[1]);
         }
         else if (this.rhythmicMultiplications[_i+1] < Number(this.rhythmsMultiplicationsRange[0])) {
           this.rhythmicMultiplications[_i+1] = Number(this.rhythmsMultiplicationsRange[0]);
         }  
      }
     } 
       // make rhythmic subdivisions between maximum(3) and minimum(0) rhythm ranges
       for (var _i = 0; _i < this.numberOfEvents; _i++) {  
         // this.rhythmicSubdivisions[_i] = this.rhythmicSubdivisions[_i] + Number(this.rhythmicOffset);
           if (this.rhythmicMultiplications[_i] > 3) {
           this.rhythmicMultiplications[_i] = 3;
         }
         else if (this.rhythmicMultiplications[_i] < 0) {
           this.rhythmicMultiplications[_i] = 0;
         }
      } 
      // TEST
      // console.log('RHYTHMIC SUBDIVISIONS OF PATTERN: ' + this.rhythmicSubdivisions);
     }
  

   printPatternInformation() {
    // console.log('This pattern has ' + this.numberOfEvents + ' events, which are: ' + this.pitches);
    // console.log('\tintervals: ' + this.melodicIntervals);
    // console.log('\tmelodic seed: ' + this.melodicSeed);
    // console.log('\trhythmic seed: ' + this.rhythmicSeed);
    // console.log('Relative rhythmic subdivisions (as vertical index of matrix) of this pattern:\n\t' + this.relativeRhythmicSubdivisions);
    // console.log('Absolute rhythmic subdivisions (as vertical index of matrix) of this pattern:\n\t' + this.rhythmicSubdivisions); 
    // console.log('Rhythmic multiplications:\n\t' + this.rhythmicMultiplications); 
   }

   /* evaluateFitness() {
     this.intervalsFitness = 0;
     if (this.melodicIntervals.length > 0) {
     for (var _i = 0; _i < this.melodicIntervals.length; _i++) {
       // do not check for the intervals which have not been supplied by the user
       // e.g. if the user specifies the probabilities for 3 intervals (unison, second and third),
       // intervals other than those do not affect the fitness in any way
       if (Math.abs(this.melodicIntervals[_i]) < (this.probIntervals.length)) {
     this.intervalsFitness += this.probIntervals[Math.abs(this.melodicIntervals[_i])];
       }
     }
     //console.log('Intervals fitness of this pattern:\n\t' + this.intervalsFitness);
    }
    else {
      //console.log('This pattern has no intervals, so it has no fitness');
     }
   } */

   // end of "pattern" class
}