import {
    MultichainMethodName,
    multichainMethodNames
} from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/models/multichain-method-name';

export function isMultichainMethodName(methodName: string): methodName is MultichainMethodName {
    return multichainMethodNames.some(multichainMethodName => multichainMethodName === methodName);
}
