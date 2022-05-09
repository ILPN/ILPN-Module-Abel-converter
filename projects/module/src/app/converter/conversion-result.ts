import {DropFile, PetriNet} from 'ilpn-components';

export interface ConversionResult {
    original: DropFile;
    result: PetriNet;
}
