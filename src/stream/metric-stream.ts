import { converters, env, injectable, Scope } from "@msiviero/knit";
import { Transform, TransformCallback } from "stream";

export enum MetricEvents {
  THROUGHPUT = "THROUGHPUT",
}
@injectable(Scope.Singleton)
export class MetricStream extends Transform {
  private sampleItems = 0;
  private sampleStartTime = process.hrtime();

  constructor(
    @env("SAMPLE_SIZE", 100, converters.number) private readonly sampleRate: number,
  ) {
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
      const sampleDuration = end[0] + end[1] / 1e9; // end[0]=seconds, end[1]=nanoseconds
      this.emit(
        MetricEvents.THROUGHPUT,
        (this.sampleItems / sampleDuration).toFixed(3),
      );
      this.sampleItems = 0;
    }
  }
}
