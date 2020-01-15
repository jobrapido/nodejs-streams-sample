import { inject, injectable, Scope } from "@msiviero/knit";
import { Transform, TransformCallback } from "stream";
import { Logger } from "winston";

@injectable(Scope.Singleton)
export class InputDecoderTransformStream extends Transform {

  constructor(
    @inject("app:logger") private readonly log: Logger,
  ) {
    super({ objectMode: true });
  }

  public _transform(record: string[], _: string, callback: TransformCallback) {
    try {
      const [name] = record;
      if (name) {
        this.push({ name });
      }
    } catch (error) {
        this.log.error(`error while trying to decode input [error=${error}]`);
    } finally {
      callback();
    }
  }
}
