import { Note, Interval, Distance, Scale, Chord, midi } from "tonal";

export class scalePitches {
    tonic_String: string;
    scaleType_String: string;
    pitch_Classes: string[] = [];

    allNotes_String: string[] = [];  // array with the names of all the notes belonging to the scale
    allNotes_Midi: number[] = [];    // array with the MIDI n. of all the notes belonging to the scale

    constructor(_tonic_String: string, _scaleType_String: string) {
          this.tonic_String = _tonic_String;
          this.scaleType_String = _scaleType_String;
          // extracting pitch classes from data fed into constructor
          this.pitch_Classes = Scale.notes(this.tonic_String,this.scaleType_String);
          // creating allNotes_String
          for (var _y = 0; _y < 6; _y++) {
              var octavesNumbers = ['2','3','4','5','6','7'];
              // considering MIDI octaves from 2 to 7
            for (var _i = 0; _i < this.pitch_Classes.length; _i++) {
                var strg = _y.toString;
                this.allNotes_String.push(this.pitch_Classes[_i].concat(octavesNumbers[_y]));
                
            } 
          }
        // creating allNotes_Midi
        for (var _a = 0; _a < this.allNotes_String.length; _a++) {
        this.allNotes_Midi.push(midi(this.allNotes_String[_a]));
        }

        this.printScaleInformation();
    }

    printScaleInformation() {
        this.print_List_Of_All_Possible_Scales();
        //console.log('SCALE \n\tPitch classes: ' + this.pitch_Classes);
        //console.log('\n\tAll notes in scale (name): ' + this.allNotes_String);
        //console.log('\n\tAll notes in scale (MIDI n.): ' + this.allNotes_Midi);
    }

    print_List_Of_All_Possible_Scales() {
        var listOfAllPossibleScales = Scale.names();
        //console.log('List of all possible scales:\n\t ' + listOfAllPossibleScales);
    }
// end of class
}