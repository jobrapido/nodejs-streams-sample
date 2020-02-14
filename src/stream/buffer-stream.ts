import { converters, env, inject, injectable, Scope } from "@msiviero/knit";
import { Transform, TransformCallback } from "stream";
import { Logger } from "winston";

@injectable(Scope.Singleton)
export class BufferTransformStream extends Transform {

  private buffer: unknown[] = [];

  constructor(
    @env("BUFFER_SIZE", 20, converters.number) private readonly bufferSize: number,
    @inject("app:logger") private readonly log: Logger,
  ) {
    super({ objectMode: true });
  }

  public _transform(object: unknown, _: string, callback: TransformCallback) {
    this.buffer.push(object);
    if (this.buffer.length >= this.bufferSize) {
      this.push(this.flushBuffer());
    }
    callback();
  }

  public _flush(callback: TransformCallback) {
    if (this.buffer.length > 0) {
      this.log.debug("Flushing buffer");
      this.push(this.flushBuffer());
    } else {
      this.log.debug("Buffer is already empty");
    }
    callback();
  }

  private flushBuffer() {
    const temp = [...this.buffer];
    this.buffer = [];
    return temp;
  }
}
