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

    getValue(address: string, size?: 'b' | 'w' | 'd') {
        if (size === 'b') {
            return this.getByteFromAddress(address.toInt());
        }
        if (size === 'w') {
            return this.getByteFromAddress(address.toInt() + 1) + this.getByteFromAddress(address.toInt());
        }

        return this.getByteFromAddress(address.toInt() + 3) + this.getByteFromAddress(address.toInt() + 2) + this.getByteFromAddress(address.toInt() + 1) + this.getByteFromAddress(address.toInt());
        
    }

    private getByteFromAddress(address: number) {
        const value = this.addresses[address];
        if (value) {
            return value;
        } else {
            return '00';
        }
    }
}
