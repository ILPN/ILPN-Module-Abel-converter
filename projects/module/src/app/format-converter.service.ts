import {Injectable, OnDestroy} from '@angular/core';
import {Arc, DropFile, IncrementingCounter, PetriNet, Place, Transition} from 'ilpn-components';
import {map, Observable, ReplaySubject} from 'rxjs';
import {DotReader} from './dot-pes/dot-reader';

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
        const result = new PetriNet();
        const placeIds = new Set<string>();
        const counter = new IncrementingCounter();

        const graph = reader(file.content);

        graph.forEachNode(n => {
            result.addTransition(new Transition(n.id, 0, 0, n.data.label));
        });

        graph.forEachLink(l => {
            placeIds.add(l.id);
            const p = new Place(l.id, 0, 0, 0);
            result.addPlace(p);
            result.addArc(this.createArc(counter, result.getTransition(l.fromId) as Transition, p));
            result.addArc(this.createArc(counter, p, result.getTransition(l.toId) as Transition));
        });

        result.getTransitions().forEach(t => {
            if (t.ingoingArcs.length === 0) {
                const p = this.createUniquePlace(counter, placeIds, 1);
                result.addPlace(p);
                result.addArc(this.createArc(counter, p, t));
            }
            if (t.outgoingArcs.length === 0) {
                const p = this.createUniquePlace(counter, placeIds, 1);
                result.addPlace(p);
                result.addArc(this.createArc(counter, t, p));
            }
        });

        return result;
    }

    private createArc(counter: IncrementingCounter, source: Place | Transition, destination: Transition | Place): Arc {
        return new Arc('a' + counter.next(), source, destination, 1);
    }

    private createUniquePlace(counter: IncrementingCounter, existingPlaces: Set<string>, marking: number): Place {
        let id;
        do {
            id = 'p' + counter.next();
        } while (existingPlaces.has(id));
        return new Place(id, 0, 0, marking);
    }
}
