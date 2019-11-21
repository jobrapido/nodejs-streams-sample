import { inject, injectable } from "@msiviero/knit";
import { Parser } from "csv-parse";
import { Stringifier } from "csv-stringify";
import { Readable, Writable } from "stream";
import { ApplicationConfig } from "./config";
import { logger } from "./logger";
import { AssignGenderTransformStream } from "./stream/assign-gender";
import { BufferTransformStream } from "./stream/buffer-stream";
import { InputDecoderTransformStream } from "./stream/input-decoder";
import {MetricStream} from "./stream/metric-stream";

@injectable()
export class GenderAssignerPipeline {

  constructor(
    private readonly configs: ApplicationConfig,
    private readonly inputDecoder: InputDecoderTransformStream,
    private readonly bufferTransformStream: BufferTransformStream,
    private readonly assignGenderTransformStream: AssignGenderTransformStream,
    @inject("fs:input") private readonly fsInput: Readable,
    @inject("fs:output") private readonly fsOutput: Writable,
  ) { }

  public assignGender() {
    return new Promise(async (resolve, reject) => {

      const csvParser = new Parser({ trim: true });

      const {
        LOCAL_INPUT_FILE_NAME,
        LOCAL_OUTPUT_FILE_NAME,
        SAMPLE_SIZE,
      } = this.configs;

      try {
        logger.info(`Starting assign gender pipeline [in=${LOCAL_INPUT_FILE_NAME}, out=${LOCAL_OUTPUT_FILE_NAME}]`);
        this
          .fsInput
          .pipe(csvParser)
          .pipe(this.inputDecoder)
          .pipe(this.bufferTransformStream)
          .pipe(this.assignGenderTransformStream)
          .pipe(new Stringifier({}))
          .pipe(new MetricStream(SAMPLE_SIZE))
          .on("metrics", (throughput: number) => {
            logger.info(`Current metrics throughput: ${throughput} elements/sec`);
          })
          .pipe(this.fsOutput
            .on("close", async () => {
              logger.info("Finished");
              resolve();
            }));
      } catch (e) {
        reject(e);
      }
    });
  }
}
