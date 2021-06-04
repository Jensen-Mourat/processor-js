import {Processor} from '../index';
import {cppCodeGenerator} from './cppCodeGenerator';

const fs = require('fs');
const args = process.argv.slice(2);
const {execSync} = require('child_process');

export const mapToObj = <U = any, R = any>(map: Map<string, U>, callback?: (v: U) => any) => {
    const obj = {};
    for (const item of [...map]) {
        const [key, value] = item;
        // @ts-ignore
        obj[key] = !callback ? value : callback(value);
    }
    return obj as R;
};

const start = () => {
    // generate result from processor
    Processor.input(args[0]);
    const simulationResult = Processor.runAllSync();
    const _registers = mapToObj(simulationResult.registers, v => parseInt(v, 16).toString(16));
    const _flags = mapToObj(simulationResult.flags, (v) => v.value.toString());
    const _simulationResult = {..._registers, ..._flags};
    //generateCppFile
    writeFile(cppCodeGenerator(args[0]));
    execSync('compileCpp.bat');
    const realResult = execSync('a.exe').toString();
    // convert c++ result to readable JSON
    const _realResult = JSON.parse(realResult);
    Object.keys(_realResult).forEach(k => {
        _realResult[k] = _realResult[k].toString(16);
    });

    //compare the result
    // !* EBP, ESP and some flags not readable from the C++ inline assembly, they are ignored *!
    const comp = Object.keys(_realResult).every(k => {
        return _simulationResult[k] === _realResult[k];
    });
    console.log(JSON.stringify({realResult: _realResult, simulatedResult: _simulationResult, comparison: comp}));
};

const writeFile = (data: string) => {
    fs.writeFileSync('cpu.cpp', data);
};
// const execFile = (file: string, callback: Function) => {
//     exec(file, function (err: any, data: any) {
//         if (err) console.log(err);
//         callback(data);
//     });
// };

const execFile = (name: string, fn?: Function) => {
    execSync(name, (err: any, data: any) => {
        if (err) {
            console.error(err);
            return;
        }
        if (fn) fn(data.toString());
    });
};
start();

// execFile('compileCpp.bat');
// execFile('a.exe', realResult);
// console.log(realResult);
// Processor.input(args[0]);
// let simulationResult = Processor.runAllSync();
// exec('a.exe', function (err: any, data: any) {
//     console.log(err);
//     realResult = data.toString()
// });
