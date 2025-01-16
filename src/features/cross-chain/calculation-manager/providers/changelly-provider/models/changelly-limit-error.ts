export interface ChangellyLimitError {
    code: number;
    message: string;
    data: {
        limits: {
            max: {
                from: string;
                to: string;
            };
            min: {
                from: string;
                to: string;
            };
        };
    };
}
