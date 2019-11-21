import { Transform, TransformCallback } from "stream";

export class MetricStream extends Transform {

  private sampleItems = 0;
  private sampleStartTime = process.hrtime();

  constructor(private readonly sampleRate: number = 100) {
    super({ objectMode: true });
  }

  public _transform(object: any, _: string, callback: TransformCallback) {
    callback(undefined, object);

    this.sampleItems++;

    if (this.sampleItems % this.sampleRate === 1) {
      this.sampleStartTime = process.hrtime();
    }

    if (this.sampleItems % this.sampleRate === 0) {
      const end = process.hrtime(this.sampleStartTime);
      const sampleDuration = end[0] + end[1] / 1000 / 1000 / 1000; // end[0]=seconds, end[1]=nanoseconds
      this.emit("metrics", (this.sampleItems / sampleDuration).toFixed(3));
      this.sampleItems = 0;
    }
  }
}
