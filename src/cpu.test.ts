const {execSync} = require('child_process');
const chalk = require('chalk');
const test = (description: string, opCode: string) => {

    const result = execSync('npx ts-node runProcessor.ts ' + opCode)
        .toString()
        .trim();
    const _result: { realResult: any, simulatedResult: any, comparison: boolean } = JSON.parse(result);
    if (_result.comparison) {
        console.log(
            chalk.greenBright('✔'),
            description + ' passed');
    } else {
        console.log(
            chalk.redBright('✖'),
            description + ' failed');
        console.log(chalk.yellowBright('⚠'), 'results: \n', _result);
    }
};

test('add eax, 1111', '0511110000');
test('mov ax, 2222', '66B82222');
