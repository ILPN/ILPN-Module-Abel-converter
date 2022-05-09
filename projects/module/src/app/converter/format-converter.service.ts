import {Injectable, OnDestroy} from '@angular/core';
import {Arc, DropFile, IncrementingCounter, PetriNet, Place, Transition} from 'ilpn-components';
import {map, Observable, ReplaySubject} from 'rxjs';
import {DotReader} from '../dot-pes/dot-reader';
import {ConversionResult} from './conversion-result';

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

    convert(files: Array<DropFile>): Observable<Array<ConversionResult>> {
        return this._fromDot$.asObservable().pipe(map(r => files.map(f => ({original: f,result: this.convertOne(r, f)}))));
    }

    private convertOne(reader: DotReader, file: DropFile): PetriNet {
        const result = new PetriNet();
        const counter = new IncrementingCounter();

        const graph = reader(file.content);

        graph.forEachNode(n => {
            result.addTransition(new Transition(n.id, 0, 0, n.data.label));
        });

        graph.forEachLink(l => {
            const p = new Place(`p${counter.next()}`, 0, 0, 0);
            result.addPlace(p);
            result.addArc(this.createArc(counter, result.getTransition(l.fromId) as Transition, p));
            result.addArc(this.createArc(counter, p, result.getTransition(l.toId) as Transition));
        });

        result.getTransitions().forEach(t => {
            if (t.ingoingArcs.length === 0) {
                const p = new Place (`p${counter.next()}`, 0, 0, 1);
                result.addPlace(p);
                result.addArc(this.createArc(counter, p, t));
            }
            if (t.outgoingArcs.length === 0) {
                const p = new Place (`p${counter.next()}`, 0, 0, 0);
                result.addPlace(p);
                result.addArc(this.createArc(counter, t, p));
            }
        });

        return result;
    }

    private createArc(counter: IncrementingCounter, source: Place | Transition, destination: Transition | Place): Arc {
        return new Arc('a' + counter.next(), source, destination, 1);
    }
}
