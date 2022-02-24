import { mnemonicToSeedSync } from 'bip39';
import { hdkey } from 'ethereumjs-wallet';

export function generateAccountsFromMnemonic(mnemonic: string, count: number) {
    const seed = mnemonicToSeedSync(mnemonic);
    const hdwallet = hdkey.fromMasterSeed(seed);
    const walletHdpath = "m/44'/60'/0'/0/";

    const accounts = [];
    for (let i = 0; i < count; i++) {
        const wallet = hdwallet.derivePath(walletHdpath + i).getWallet();
        const address = `0x${wallet.getAddress().toString('hex')}`;
        const privateKey = wallet.getPrivateKey().toString('hex');
        accounts.push({ address, privateKey });
    }
    return accounts;
}
