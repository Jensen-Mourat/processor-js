import {skipWhile} from 'rxjs/operators';
import {Processor} from '../index';
import {cppCodeGenerator} from './cppCodeGenerator';

const fs = require('fs');
const args = process.argv.slice(2);
const {execSync} = require('child_process');

const start = () => {
    // generate result from processor
    Processor.input(args[0]);
    const simulationResult = Processor.runAllSync();
    //generateCppFile
    writeFile(cppCodeGenerator(args[0]));
    execSync('compileCpp.bat');
    const realResult = execSync('a.exe').toString();
    console.log(true);
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



