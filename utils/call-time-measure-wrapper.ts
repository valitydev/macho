type MeasureFn = (...args: any[]) => Promise<any>;

export class Measure {
    result: any;
    time: number;
}

export function measure(target: MeasureFn, context: any, args?: object): Promise<Measure> {
    return new Promise((resolve, reject) => {
        const startTime = new Date().getTime();
        return target
            .apply(context, args)
            .then(result => {
                resolve({
                    result,
                    time: new Date().getTime() - startTime
                });
            })
            .catch(error => reject(error));
    });
}
