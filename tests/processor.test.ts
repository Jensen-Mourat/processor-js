import {suite, test} from '@testdeck/mocha';
import * as _chai from 'chai';
import {Memory} from '../src/memory';
import {Processor} from '../index';

_chai.should();

@suite
class processorTest {

    before() {

    }

    @test 'processor test'() {
        // Processor.process({instruction: 'add', operand1: {register: 'eax'}, operand2: {value: 'ffffffff'}});
        // Processor.process({instruction: 'add', operand1: {register: 'eax'}, operand2: {value: '1'}});
        Processor.process({instruction: 'add', operand1: {register: 'ax'}, operand2: {value: '7000'}});
        Processor.process({instruction: 'add', operand1: {register: 'ax'}, operand2: {value: '1'}});
        Processor.process({instruction: 'add', operand1: {register: 'al'}, operand2: {value: 'ffffffff'}});
        Processor.process({instruction: 'add', operand1: {register: 'al'}, operand2: {value: '1'}});
        Processor.process({instruction: 'add', operand1: {register: 'ah'}, operand2: {value: 'ffffffff'}});
        Processor.process({instruction: 'add', operand1: {register: 'ah'}, operand2: {value: '1'}});
    }
}
