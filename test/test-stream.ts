import { Readable, Writable } from "stream";

export class TestOutStream<T> extends Writable {

  public static asObjectStream<T>() {
    return new TestOutStream<T>(true);
  }

  public static asBufferedStream<T>() {
    return new TestOutStream<T>(false);
  }

  private readonly chunks: T[] = [];

  private constructor(objectMode: boolean) {
    super({ objectMode });
  }

  public _write(chunk: T, _: string, done: (error?: Error | null) => void) {
    this.chunks.push(chunk);
    done();
  }

  public _final(done: (error?: Error | null) => void) {
    this.emit("close");
    done();
  }

  public written = () => [...this.chunks];
}

export class TestInputStream {

  public static fromBuffers(...buffers: Buffer[]): Readable {
    return new BufferInputStream(buffers);
  }

  public static fromObjects<T>(...objects: T[]): Readable {
    return new ObjectInputStream(objects);
  }
}

class ObjectInputStream<T> extends Readable {

  private cursor: number = 0;

  public constructor(private readonly objects: T[]) {
    super({ objectMode: true });
  }

  public _read(size: number) {
    const slice = this.objects.slice(this.cursor, this.cursor + size);
    slice.forEach((el) => this.push(el));
    this.cursor += size;
    if (this.cursor >= this.objects.length) {
      this.push(null);
    }
  }
}

class BufferInputStream extends Readable {

  private cursor: number = 0;
  private readonly buffer: Buffer;

  public constructor(buffers: Buffer[]) {
    super();
    this.buffer = Buffer.concat(buffers);
  }

  public _read(size: number) {
    const slice = this.buffer.slice(this.cursor, this.cursor + size);
    this.push(slice);
    this.cursor += size;
    if (this.cursor >= this.buffer.length) {
      this.push(null);
    }
  }
}
