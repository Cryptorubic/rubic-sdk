import { BehaviorSubject } from 'rxjs';

export class SignatureService {
    private static _instance: SignatureService;

    private _isGetGasLimitCall$ = new BehaviorSubject<boolean>(false);

    public isGetGasLimitCall$ = this._isGetGasLimitCall$.asObservable();

    public get isGetGasLimitCall(): boolean {
        return this._isGetGasLimitCall$.value;
    }

    private constructor() {}

    public static getInstance() {
        if (!this._instance) {
            this._instance = new SignatureService();
        }

        return this._instance;
    }

    public setIsGetGasLimitCall(bool: boolean): void {
        this._isGetGasLimitCall$.next(bool);
    }
}
