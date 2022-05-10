import {Component} from '@angular/core';
import {FormatConverterService} from './converter/format-converter.service';
import {DropFile, PetriNetSerialisationService} from 'ilpn-components';
import {ConversionResult} from './converter/conversion-result';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    filesProcessed = false;
    files: Array<DropFile> = [];

    constructor(private _converter: FormatConverterService, private _serializer: PetriNetSerialisationService) {
    }

    transformPesFile(files: Array<DropFile>) {
        this.filesProcessed = false;
        this._converter.convertPes(files).subscribe(arr => this.passFilesToDownload(arr));
    }

    transformLatticeFile(files: Array<DropFile>) {
        this.filesProcessed = false;
        this._converter.convertLattice(files).subscribe(arr => this.passFilesToDownload(arr));
    }

    private passFilesToDownload(results: Array<ConversionResult>) {
        this.files = results.map(r => new DropFile(r.original.name, this._serializer.serialise(r.result), 'pn'));
        this.filesProcessed = true;
    }
}
