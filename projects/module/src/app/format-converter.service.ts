import {Injectable, OnDestroy} from '@angular/core';
import {DropFile, PetriNet} from 'ilpn-components';
import {map, Observable, ReplaySubject} from 'rxjs';
import {DotReader} from './dot-reader';

@Injectable({
    providedIn: 'root'
})
export class FormatConverterService implements OnDestroy {

    private _fromDot$: ReplaySubject<DotReader>;

    constructor() {
        this._fromDot$ = new ReplaySubject<DotReader>(1);

        // @ts-ignore
        const promise = import('ngraph.fromdot');
        promise.then(result => {
            this._fromDot$.next(result.default);
        })
    }

    ngOnDestroy() {
        this._fromDot$.complete();
    }

    convert(files: Array<DropFile>): Observable<Array<PetriNet>> {
        return this._fromDot$.asObservable().pipe(map(r => files.map(f => this.convertOne(r, f))));
    }

    private convertOne(reader: DotReader, file: DropFile): PetriNet {
        console.log (reader(file.content));
        return new PetriNet();
    }
}
