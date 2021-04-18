import {suite, test} from '@testdeck/mocha';
import * as _chai from 'chai';
import {Memory} from '../src/memory';
import {Processor} from '../index';
import {cppCodeGenerator, processOpcode} from '../src/cppCodeGenerator';

_chai.should();

@suite
class processorTest {

    before() {
        // Processor.process({instruction: 'add', operand1: {register: 'eax'}, operand2: {value: '1111111'}});
    }

    @test 'random'() {
        console.log(parseInt('-0A', 16));
    }

    @test 'memory test'() {
        const m = new Memory();
        m.setValue('00000000', '00100001');
        console.log(m.getValue('00000001'));
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

    @test 'add r, r'() {
        Processor.process({
            instruction: 'add',
            operand1: {register: 'eax'},
            operand2: {register: 'eax', displacement: 'FFFFFFFF', pointer: 'd'}
        });
    }

    @test 'jmp'() {
        console.log(Processor.input('01C0EBFC'));
        // (async () => {
        //     await Processor.runAllSync();
        //     console.log('ran');
        // })();
    }

    @test 'cpp generator'() {
        console.log(processOpcode('0511110000'));
    }
}
