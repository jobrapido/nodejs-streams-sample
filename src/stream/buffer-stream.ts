import { injectable, Scope } from "@msiviero/knit";
import { Transform, TransformCallback } from "stream";
import { ApplicationConfig } from "../config";
import { logger } from "../logger";

@injectable(Scope.Singleton)
export class BufferTransformStream extends Transform {

  private buffer: unknown[] = [];

  constructor(
    private readonly configs: ApplicationConfig,
  ) {
    super({ objectMode: true });
  }

  public _transform(object: unknown, _: string, callback: TransformCallback) {
    this.buffer.push(object);
    if (this.buffer.length >= this.configs.BUFFER_SIZE) {
      this.push(this.flushBuffer());
    }
    callback();
  }

  public _flush(callback: TransformCallback) {
    if (this.buffer.length > 0) {
      logger.debug("Flushing buffer");
      this.push(this.flushBuffer());
    } else {
      logger.debug("Buffer is already empty");
    }
    callback();
  }

  private flushBuffer() {
    const temp = [...this.buffer];
    this.buffer = [];
    return temp;
  }
}
