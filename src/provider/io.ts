import { Provider } from "@msiviero/knit";
import { Parser } from "csv-parse";
import { Stringifier } from "csv-stringify";
import { createReadStream, createWriteStream, ReadStream, WriteStream } from "fs";

export class ReadStreamProvider implements Provider<ReadStream> {
    public provide = () => createReadStream("data/input/input.csv");
}

export class WriteStreamProvider implements Provider<WriteStream> {
    public provide = () => createWriteStream("data/output/output.csv");
}

export class CsvParserProvider implements Provider<Parser> {
    public provide = () => new Parser({ trim: true });
}

export class CsvStringifier implements Provider<Stringifier> {
    public provide = () => new Stringifier({});
}
