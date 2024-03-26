import { BehaviorSubject } from 'rxjs';

export class OkuSwapManager {
    private static _instance: OkuSwapManager;

    private _isGetGasLimitCall$ = new BehaviorSubject<boolean>(false);

    public get isGetGasLimitCall(): boolean {
        return this._isGetGasLimitCall$.value;
    }

    private constructor() {}

    public static getInstance() {
        if (!this._instance) {
            this._instance = new OkuSwapManager();
        }

        return this._instance;
    }

    public setIsGetGasLimitCall(bool: boolean): void {
        this._isGetGasLimitCall$.next(bool);
    }
}
