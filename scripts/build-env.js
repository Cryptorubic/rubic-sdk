const fs = require('fs');
const commander = require('commander');
const program = new commander.Command();

program
    .option('--eth <eth-prc>')
    .option('--polygon <polygon-rpc>')
    .option('--goerli <goerli-rpc')
    .option('--mumbai <mumbai-rpc>')
    .option('--bsct <bsct-rpc>')
    .parse();

const options = program.opts();

if (!options.eth || !options.polygon) {
    throw new Error('You must pass providers for all networks.');
}

const config = `
global.sdkEnv = {
    providers: {
        ETH: {
            jsonRpcUrl: '${options.eth}',
            blockNumber: 13961175
        },
        POLYGON: {
            jsonRpcUrl: '${options.polygon}',
            blockNumber: 23571568
        },
        GOERLI: {
            jsonRpcUrl: '${options.goerli}',
            blockNumber: 9008945
        },
        MUMBAI: {
            jsonRpcUrl: '${options.mumbai}',
            blockNumber: 42000000
        }
        BSCT: {
            jsonRpcUrl: '${options.bsct}',
            blockNumber: 34836626
        }        
    }
}
`;

fs.writeFileSync('./__tests__/env.js', config);
