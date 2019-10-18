import { injectable, Scope } from "@msiviero/knit";
import { Transform, TransformCallback } from "stream";
import { logger } from "../logger";
import { Record } from "./types";

@injectable(Scope.Singleton)
export class InputDecoderTransformStream extends Transform {

  constructor() {
    super({ objectMode: true });
  }

  public _transform(record: string[], _: string, callback: TransformCallback) {
    try {
      const [name] = record;
      const row: Record = {
        name: name || "",
      };
      this.push(row);
      console.log(record);

    } catch (error) {
      logger.error(`error while trying to decode input [error=${error}]`);
    } finally {
      callback();
    }
  }
}
