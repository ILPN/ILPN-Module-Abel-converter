import {Component} from '@angular/core';
import {FormatConverterService} from './format-converter.service';
import {DropFile} from 'ilpn-components';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    filesProcessed = false;
    files: Array<DropFile> = [];

    constructor(private _converter: FormatConverterService) {
    }

    transformFile(files: Array<DropFile>) {
        this.filesProcessed = false;
        this._converter.convert(files).subscribe(r => {
            this.filesProcessed = true;

        });
    }
}
