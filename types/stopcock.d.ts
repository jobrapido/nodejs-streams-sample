declare namespace stopcock { }

declare function stopcock<I, O>(fn: (i: I) => Promise<O>, options: { limit?: number, bucketSize?: number, interval?: number }): (i: I) => Promise<O>;

export = stopcock;