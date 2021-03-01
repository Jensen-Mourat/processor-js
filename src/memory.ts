import {of} from 'rxjs';

export class Memory {
    private addresses = [];
    private codeSegment = [];
    private dataSegment = [];
    private stack = [];
    private max;

    constructor() {
        this.max = parseInt('ffffffff', 16);
    }
}
