import { inject, injectable } from "@msiviero/knit";
import { Parser } from "csv-parse";
import { Stringifier } from "csv-stringify";
import { Readable, Writable } from "stream";
import { ApplicationConfig } from "../config";
import { logger } from "../logger";
import { AssignLabelTransformStream } from "../stream/assign-label";
import { BufferTransformStream } from "../stream/buffer-stream";
import { InputDecoderTransformStream } from "../stream/input-decoder";

@injectable()
export class LabelAssignerPipeline {

  constructor(
    private readonly configs: ApplicationConfig,
    private readonly inputDecoder: InputDecoderTransformStream,
    private readonly bufferTransformStream: BufferTransformStream,
    private readonly assignLabelTransformStream: AssignLabelTransformStream,
    @inject("fs:input") private readonly fsInput: Readable,
    @inject("fs:output") private readonly fsOutput: Writable,
  ) { }

  public assignLabel() {
    return new Promise(async (resolve, reject) => {

      const csvParser = new Parser({ trim: true });

      const {
        LOCAL_INPUT_FILE_NAME,
        LOCAL_OUTPUT_FILE_NAME,
      } = this.configs;

      try {
        logger.info("try...." + LOCAL_INPUT_FILE_NAME + LOCAL_OUTPUT_FILE_NAME);
        this
          .fsInput
          .pipe(csvParser)
          .pipe(this.inputDecoder)
          .pipe(this.bufferTransformStream)
          .pipe(this.assignLabelTransformStream)
          .pipe(new Stringifier({}))
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
