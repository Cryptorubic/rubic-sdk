import { isMulticoinReceiverAddressCorrect } from 'src/core/blockchain/utils/multicoin-receiver-address-validator';
import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';

describe('Address Validator tests', () => {

    test('Should give true on the address', async () => {
        const result = await isMulticoinReceiverAddressCorrect('0x12eFaddaB67E93846B50dB287de3ae4fE4f47f7c', BLOCKCHAIN_NAME.ETHEREUM, /.*/)
        expect(result).toBe(true)
    });
    
    test('Should give an error on the address', async () => {
        const result = await isMulticoinReceiverAddressCorrect('0x92eFaddAB67E93846B50dB287de3ae4fE4f47f7c', BLOCKCHAIN_NAME.ETHEREUM, /.*/)
        expect(result).toBe(false)
    });

});