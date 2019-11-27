import { Transform, TransformCallback } from "stream";
import { ApplicationConfig } from "../config";
import { injectable, Scope } from "@msiviero/knit";

export enum MetricEvents {
  THROUGHPUT = "THROUGHPUT"
}
@injectable(Scope.Singleton)
export class MetricStream extends Transform {
  private sampleItems = 0;
  private sampleStartTime = process.hrtime();
  private sampleRate = 100;

  constructor(readonly configs: ApplicationConfig) {
    super({ objectMode: true });
    this.sampleRate = configs.SAMPLE_SIZE;
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
        (this.sampleItems / sampleDuration).toFixed(3)
      );
      this.sampleItems = 0;
    }
  }
}
