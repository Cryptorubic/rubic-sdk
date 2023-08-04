export interface IzumiPool {
    readonly address: string;
    readonly tokenX: string;
    readonly tokenX_address: string;
    readonly tokenY: string;
    readonly tokenY_address: string;
    readonly fee: number;
}

export interface IzumiPoolResponse {
    readonly data: ReadonlyArray<IzumiPool>;
}
