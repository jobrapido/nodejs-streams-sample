import { injectable, Scope } from "@msiviero/knit";
import { Transform, TransformCallback } from "stream";
import { logger } from "../logger";

@injectable(Scope.Singleton)
export class InputDecoderTransformStream extends Transform {

  constructor() {
    super({ objectMode: true });
  }

  public _transform(record: string[], _: string, callback: TransformCallback) {
    try {
      const [name] = record;
      if (name) {
        this.push({ name });
      }
    } catch (error) {
      logger.error(`error while trying to decode input [error=${error}]`);
    } finally {
      callback();
    }
  }
}
