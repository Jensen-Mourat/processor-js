import {suite, test} from '@testdeck/mocha';
import * as _chai from 'chai';
import {Memory} from '../src/memory';

_chai.should();

@suite
class processorTest {

    before() {

    }

    @test 'porcessor test'() {
        new Memory();
    }
}
