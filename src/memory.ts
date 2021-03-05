import {of} from 'rxjs';
import './utils/hex.utils';


export class Memory {
    private addresses: string[] = [];
    private states: string[][] = [];
    private codeSegment = [];
    private dataSegment = [];
    private stack = [];
    private max;

    constructor() {
        this.max = parseInt('ffffffff', 16);
    }

    saveState() {
        this.states.push(this.addresses);
    }

    previousState() {
        if (this.states.length > 0) {
            this.addresses = this.states.pop()!;
        } else {
            this.addresses = [];
        }
    }

    getPreviousAddress(add: string) {
        const previousAddress = this.states[this.states.length - 1];
        if (previousAddress) {
            return this.getValue(add, undefined, previousAddress);
        } else {
            return '00000000';
        }
    }

    reset() {
        this.addresses = [];
        this.states = [];
    }

    setValue(address: string, value: string, size?: 'b' | 'w' | 'd') {
        address = address.fitTo(8);
        if (size === 'b') {
            this.addresses[address.toInt()] = value.fitTo(2);
        }

        if (size === 'w') {
            this.addresses[address.toInt()] = value.fitTo(2);
            this.addresses[address.toInt() + 1] = value.fitTo(4).substr(0, 2);
        }

        if (size === 'd' || !size) {
            this.addresses[address.toInt()] = value.fitTo(2);
            this.addresses[address.toInt() + 1] = value.fitTo(4).substr(0, 2);
            this.addresses[address.toInt() + 2] = value.fitTo(6).substr(0, 2);
            this.addresses[address.toInt() + 3] = value.fitTo(8).substr(0, 2);
        }
    }

    getValue(address: string, size?: 'b' | 'w' | 'd', addresses?: string[]) {
        if (size === 'b') {
            return this.getByteFromAddress(address.toInt(), addresses);
        }
        if (size === 'w') {
            return this.getByteFromAddress(address.toInt() + 1, addresses) + this.getByteFromAddress(address.toInt(), addresses);
        }

        return this.getByteFromAddress(address.toInt() + 3, addresses) + this.getByteFromAddress(address.toInt() + 2, addresses) + this.getByteFromAddress(address.toInt() + 1, addresses) + this.getByteFromAddress(address.toInt(), addresses);
    }

    private getByteFromAddress(address: number, addresses?: string[]) {
        const value = !addresses ? this.addresses[address] : addresses[address];
        if (value) {
            return value;
        } else {
            return '00';
        }
    }
}
