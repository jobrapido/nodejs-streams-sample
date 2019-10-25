import { Mock, Times } from "typemoq";
import { ApplicationConfig } from "../../src/config";
import {GenderAssignerPipeline} from "../../src/service/gender-assigner-pipeline";
import { GenderizeAPI } from "../../src/service/genderize-api";
import { AssignGenderTransformStream } from "../../src/stream/assign-gender";
import { BufferTransformStream } from "../../src/stream/buffer-stream";
import { InputDecoderTransformStream } from "../../src/stream/input-decoder";
import { TestInputStream, TestOutStream } from "../test-stream";

describe("Gender assigner module", () => {

  it("test pipeline", async () => {

    const configs = Mock.ofType(ApplicationConfig);
    const genderizeApi = Mock.ofType(GenderizeAPI);
    const resultName1 = {name: "name1", gender: "male", probability: "0.99"};
    const resultName2 = {name: "name2", gender: "female", probability: "0.59"};
    const resultName3 = {name: "name3", gender: "male", probability: "0.99"};
    const resultName4 = {name: "name4", gender: "female", probability: "0.59"};

    genderizeApi.setup((instance) => instance
      .genderize("name1"))
      .returns(() => Promise.resolve(resultName1));

    genderizeApi.setup((instance) => instance
      .genderize("name2"))
      .returns(() => Promise.resolve(resultName2));
    genderizeApi.setup((instance) => instance
      .genderize("name3"))
      .returns(() => Promise.resolve(resultName3));
    genderizeApi.setup((instance) => instance
      .genderize("name4"))
      .returns(() => Promise.resolve(resultName4));

    const inputDecoder = new InputDecoderTransformStream();
    const bufferTransformStream = new BufferTransformStream(configs.object);
    const assignGenderTransformStream = new  AssignGenderTransformStream(genderizeApi.object);

    const chunk = `name1\nname2\nname3\nname4\n`;
    const inputStream = TestInputStream.fromBuffers(Buffer.from(chunk));
    inputStream.pipe(process.stdout);

    const outputStream = TestOutStream.asBufferedStream<Buffer>();

    const underTest = new GenderAssignerPipeline(
      configs.object,
      inputDecoder,
      bufferTransformStream,
      assignGenderTransformStream,
      inputStream,
      outputStream,
    );

    await underTest.assignGender();

    expect(outputStream.written().map((b) => b.toString("utf-8")))
      .toEqual([
        "name1,male,0.99\n",
        "name2,female,0.59\n",
        "name3,male,0.99\n",
        "name4,female,0.59\n",
      ]);

    genderizeApi.verify(
    (instance) => instance.genderize("name1"),
    Times.once());

    genderizeApi.verify(
    (instance) => instance.genderize("name2"),
    Times.once());

    genderizeApi.verify(
    (instance) => instance.genderize("name3"),
    Times.once());

    genderizeApi.verify(
    (instance) => instance.genderize("name4"),
    Times.once());

  });

  it("should return default values when genderize api throws error", async () => {

    const configs = Mock.ofType(ApplicationConfig);
    const genderizeApi = Mock.ofType(GenderizeAPI);
    const resultName1 = {name: "name1", gender: "male", probability: "0.99"};

    genderizeApi.setup((instance) => instance
      .genderize("name1"))
      .returns(() => Promise.resolve(resultName1));

    genderizeApi.setup((instance) => instance
      .genderize("name2"))
      .returns(() => Promise.reject(new Error("fake error")));

    const inputDecoder = new InputDecoderTransformStream();
    const bufferTransformStream = new BufferTransformStream(configs.object);
    const assignGenderTransformStream = new  AssignGenderTransformStream(genderizeApi.object);

    const chunk = `name1\nname2\n`;
    const inputStream = TestInputStream.fromBuffers(Buffer.from(chunk));
    inputStream.pipe(process.stdout);

    const outputStream = TestOutStream.asBufferedStream<Buffer>();

    const underTest = new GenderAssignerPipeline(
      configs.object,
      inputDecoder,
      bufferTransformStream,
      assignGenderTransformStream,
      inputStream,
      outputStream,
    );

    await underTest.assignGender();

    expect(outputStream.written().map((b) => b.toString("utf-8")))
      .toEqual([
        "name1,male,0.99\n",
        "name2,NP,0.0\n",
      ]);

    genderizeApi.verify(
    (instance) => instance.genderize("name1"),
    Times.once());

    genderizeApi.verify(
    (instance) => instance.genderize("name2"),
    Times.once());

  });
});
