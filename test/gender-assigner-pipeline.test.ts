import { Options, Parser } from "csv-parse";
import { Stringifier } from "csv-stringify";
import { Mock, Times } from "typemoq";
import { Logger } from "winston";
import { GenderAssignerPipeline } from "../src/gender-assigner-pipeline";
import { GenderizeAPI } from "../src/service/genderize-api";
import { AssignGenderTransformStream } from "../src/stream/assign-gender";
import { BufferTransformStream } from "../src/stream/buffer-stream";
import { InputDecoderTransformStream } from "../src/stream/input-decoder";
import { MetricStream } from "../src/stream/metric-stream";
import { TestInputStream, TestOutStream } from "./test-stream";

const parserOpts: Options = { trim: true };
const logger = Mock.ofType<Logger>();

describe("Gender assigner module", () => {
  it("test pipeline", async () => {
    const genderizeApi = Mock.ofType<GenderizeAPI>();
    const csvParser = new Parser(parserOpts);
    const stringifier = new Stringifier({});

    const resultName1 = { name: "name1", gender: "male", probability: "0.99" };
    const resultName2 = {
      name: "name2",
      gender: "female",
      probability: "0.59",
    };
    const resultName3 = { name: "name3", gender: "male", probability: "0.99" };
    const resultName4 = {
      name: "name4",
      gender: "female",
      probability: "0.59",
    };

    genderizeApi
      .setup((instance) => instance.genderize("name1"))
      .returns(() => Promise.resolve(resultName1));
    genderizeApi
      .setup((instance) => instance.genderize("name2"))
      .returns(() => Promise.resolve(resultName2));
    genderizeApi
      .setup((instance) => instance.genderize("name3"))
      .returns(() => Promise.resolve(resultName3));
    genderizeApi
      .setup((instance) => instance.genderize("name4"))
      .returns(() => Promise.resolve(resultName4));

    const inputDecoder = new InputDecoderTransformStream(logger.object);
    const bufferTransformStream = new BufferTransformStream(20, logger.object);
    const assignGenderTransformStream = new AssignGenderTransformStream(
      genderizeApi.object,
      logger.object,
    );
    const metricStream = new MetricStream(100);

    const chunk = `name1\nname2\nname3\nname4\n`;
    const inputStream = TestInputStream.fromBuffers(Buffer.from(chunk));
    const outputStream = TestOutStream.asBufferedStream<Buffer>();

    const underTest = new GenderAssignerPipeline(
      "LOCAL_INPUT_FILENAME",
      "LOCAL_OUTPUT_FILENAME",
      inputDecoder,
      bufferTransformStream,
      assignGenderTransformStream,
      metricStream,
      stringifier,
      csvParser,
      inputStream,
      outputStream,
      logger.object,
    );

    await underTest.assignGender();

    expect(outputStream.written().map((b) => b.toString("utf-8"))).toEqual([
      "name1,male,0.99\n",
      "name2,female,0.59\n",
      "name3,male,0.99\n",
      "name4,female,0.59\n",
    ]);

    genderizeApi.verify((instance) => instance.genderize("name1"), Times.once());
    genderizeApi.verify((instance) => instance.genderize("name2"), Times.once());
    genderizeApi.verify((instance) => instance.genderize("name3"), Times.once());
    genderizeApi.verify((instance) => instance.genderize("name4"), Times.once());
  });

  it("should return default values when genderize api throws error", async () => {
    const genderizeApi = Mock.ofType<GenderizeAPI>();
    const metricStream = new MetricStream(100);
    const csvParser = new Parser(parserOpts);
    const stringifier = new Stringifier({});

    const resultName1 = { name: "name1", gender: "male", probability: "0.99" };

    genderizeApi
      .setup((instance) => instance.genderize("name1"))
      .returns(() => Promise.resolve(resultName1));

    genderizeApi
      .setup((instance) => instance.genderize("name2"))
      .returns(() => Promise.reject(new Error("fake error")));

    const inputDecoder = new InputDecoderTransformStream(logger.object);
    const bufferTransformStream = new BufferTransformStream(20, logger.object);
    const assignGenderTransformStream = new AssignGenderTransformStream(genderizeApi.object, logger.object);

    const chunk = `name1\nname2\n`;
    const inputStream = TestInputStream.fromBuffers(Buffer.from(chunk));
    const outputStream = TestOutStream.asBufferedStream<Buffer>();

    const underTest = new GenderAssignerPipeline(
      "LOCAL_INPUT_FILENAME",
      "LOCAL_OUTPUT_FILENAME",
      inputDecoder,
      bufferTransformStream,
      assignGenderTransformStream,
      metricStream,
      stringifier,
      csvParser,
      inputStream,
      outputStream,
      logger.object,
    );

    await underTest.assignGender();

    expect(outputStream.written().map((b) => b.toString("utf-8"))).toEqual([
      "name1,male,0.99\n",
      "name2,NP,0.0\n",
    ]);

    genderizeApi.verify((instance) => instance.genderize("name1"), Times.once());
    genderizeApi.verify((instance) => instance.genderize("name2"), Times.once());
  });
});
