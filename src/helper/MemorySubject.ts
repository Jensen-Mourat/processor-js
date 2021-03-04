import {BehaviorSubject} from 'rxjs';
// @ts-ignore
import * as isEqual from 'lodash.isequal';
// @ts-ignore
import * as cloneDeep from 'lodash.clonedeep';

export class MemorySubject<T> extends BehaviorSubject<T> {
    private previousStates: T[] = [];

    constructor(val: T) {
        super(cloneDeep(val));
    }

    next(value: T): void {
        if (!isEqual(value, this.getValue())) {
            this.previousStates.push(this.getValue());
            super.next(cloneDeep(value));
        }
    }

    previous() {
        const previous = this.previousStates.pop();
        if (previous !== undefined) {
            super.next(cloneDeep(previous));
        }
    }

    reset(value: T) {
        this.previousStates = [];
        super.next(cloneDeep(value));
    }

    getPreviousValue(position?: number): T | undefined {
        return this.previousStates[this.previousStates.length - (position ?? 1)];
    }
}
