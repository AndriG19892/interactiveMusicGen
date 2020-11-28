export class ArgumentsForPhrase {

// variables not (directly) entered by the user
_numberOfPatterns: number;     
_numberOfEventsInEachPattern: number[] = [];
_pitchesRanges: number[] = [];
_rhythmsRanges: number[] = [];
_melodicSeedForEachPattern: number[] = [];
_rhythmicSeedForEachPattern: number[] = [];
// variables entered directly by the user
_probPitches: number[] = []; 
_weightPitches: number;
_probIntervals: number[] = []; 
_weightIntervals: number;
} // end of interface