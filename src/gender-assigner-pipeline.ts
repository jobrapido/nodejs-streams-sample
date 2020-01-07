import { env, inject, injectable } from "@msiviero/knit";
import { Parser } from "csv-parse";
import { Stringifier } from "csv-stringify";
import { Readable, Writable } from "stream";
import { Logger } from "winston";
import { AssignGenderTransformStream } from "./stream/assign-gender";
import { BufferTransformStream } from "./stream/buffer-stream";
import { MetricEvents, MetricStream } from "./stream/metric-stream";

@injectable()
export class GenderAssignerPipeline {
  constructor(
    @env("LOCAL_INPUT_FILE_NAME", "input.csv") public readonly localInputFilename: string,
    @env("LOCAL_OUTPUT_FILE_NAME", "output.csv") public readonly localOutputFilename: string,
    private readonly bufferTransformStream: BufferTransformStream,
    private readonly assignGenderTransformStream: AssignGenderTransformStream,
    private readonly metricStream: MetricStream,
    @inject("csv:stringifier") private readonly stringifier: Stringifier,
    @inject("csv:parser") private readonly csvParser: Parser,
    @inject("fs:input") private readonly fsInput: Readable,
    @inject("fs:output") private readonly fsOutput: Writable,
    @inject("app:logger") private readonly log: Logger,
  ) { }

  public assignGender() {
    return new Promise((resolve, reject) => {
      try {
        this.log.info(
          `Starting assign gender pipeline [in=${this.localInputFilename}, out=${this.localOutputFilename}]`);

        this.fsInput
          .pipe(this.csvParser)
          .pipe(this.bufferTransformStream)
          .pipe(this.assignGenderTransformStream)
          .pipe(this.stringifier)
          .pipe(this.metricStream)
          .on(MetricEvents.THROUGHPUT, (throughput: number) => this.log.info(`Current metrics throughput: ${throughput} elements/sec`))
          .pipe(this.fsOutput)
          .on("close", async () => {
            this.log.info("Finished");
            resolve();
          });
      } catch (e) {
        reject(e);
      }
    });
  }
}
