import {skipWhile} from 'rxjs/operators';
import {Processor} from '../index';
import {cppCodeGenerator} from './cppCodeGenerator';

let fs = require('fs');
let args = process.argv.slice(2);
// let exec = require('child_process').execFile;
const {execSync} = require('child_process');


const start = () => {
    // generate result from processor
    Processor.input(args[0]);
    let simulationResult = Processor.runAllSync();
    //generateCppFile
    writeFile(cppCodeGenerator(args[0]));
    execSync('compileCpp.bat');
    let realResult = execSync('a.exe').toString();
    console.log({simulationResult}, {realResult});
};

// const execFile = (file: string, callback: Function) => {
//     exec(file, function (err: any, data: any) {
//         if (err) console.log(err);
//         callback(data);
//     });
// };

const writeFile = (data: string) => {
    fs.writeFileSync('cpu.cpp', data);
};

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



