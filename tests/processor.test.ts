import {suite, test} from '@testdeck/mocha';
import * as _chai from 'chai';
import {Memory} from '../src/memory';
import {Processor} from '../index';
import {cppCodeGenerator, processOpcode} from '../src/cppCodeGenerator';
import {hexTobin} from '../src/helper/Functions';
import {convertToTwosComp} from '../src/helper/twosComplement';

_chai.should();

@suite
class processorTest {

    before() {
        // Processor.process({instruction: 'add', operand1: {register: 'eax'}, operand2: {value: '1111111'}});
    }

    @test 'random'() {
        // Processor.setRegisterValue('ah', '1234');
        // console.log(Processor.getRegisterValue('ah'));
    }

    @test 'random2'(){
        export const convertToTwosComp = (s: string) => {
            s = makeHexLengthEven(s);
            const hexL = s.length;
            const hex = parseInt(s, 16);
            const maxHex = parseInt('ffffffff'.slice(0, hexL), 16);
            const twosC = (maxHex - hex + 1).toString(16).toUpperCase();
            return makeValueToByte(twosC, hexL as 2 | 4 | 8);
        };
        const value1 = '10';
        const value2 = ('10');
        const constant = 8;
        const result = '100';
        const bin1 = hexTobin(value1, constant);
        const bin2 = hexTobin(value2, constant);
        const binR = hexTobin(result, constant);
        const msb1 = bin1[0];
        const msb2 = bin2[0];
        const msbR = binR[0];
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
