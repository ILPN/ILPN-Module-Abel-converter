import {Component} from '@angular/core';
import {FormatConverterService} from './converter/format-converter.service';
import {DropFile, PetriNetSerialisationService} from 'ilpn-components';

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

    transformFile(files: Array<DropFile>) {
        this.filesProcessed = false;
        this._converter.convert(files).subscribe(arr => {
            this.files = arr.map(r => new DropFile(r.original.name, this._serializer.serialise(r.result), 'pn'));
            this.filesProcessed = true;
        });
    }
}
