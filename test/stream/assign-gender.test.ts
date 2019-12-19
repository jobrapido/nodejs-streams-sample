import { It, Mock, Times } from "typemoq";
import { GenderizeAPI } from "../../src/service/genderize-api";
import { AssignGenderTransformStream } from "../../src/stream/assign-gender";
import { Person } from "../../src/stream/types";
import { TestInputStream, TestOutStream } from "../test-stream";

describe("assign gender transform stream test suite", () => {

  const mockGenderizeAPI = Mock.ofType<GenderizeAPI>();

  let underTest: AssignGenderTransformStream;
  let record1: Person;
  let record2: Person;
  let record3: Person;

  beforeEach(() => {
    mockGenderizeAPI.reset();
    record1 = { name: "name1" };
    record2 = { name: "name2" };
    record3 = { name: "name3" };

    underTest = new AssignGenderTransformStream(mockGenderizeAPI.object);
  });

  it("should genderize correctly", (done) => {
    const personWithGender1 = { name: "name1", gender: "male", probability: "0.97" };
    const personWithGender2 = { name: "name2", gender: "female", probability: "0.87" };
    const personWithGender3 = { name: "name3", gender: "male", probability: "0.57" };

    mockGenderizeAPI.setup((instance) => instance
      .genderize(record1.name))
      .returns(() => Promise.resolve(personWithGender1));

    mockGenderizeAPI.setup((instance) => instance
      .genderize(record2.name))
      .returns(() => Promise.resolve(personWithGender2));

    mockGenderizeAPI.setup((instance) => instance
      .genderize(record3.name))
      .returns(() => Promise.resolve(personWithGender3));

    const outputStream = TestOutStream.asObjectStream();

    TestInputStream
      .fromObjects<Person[]>(
        [record1, record2, record3],
      )
      .pipe(underTest)
      .pipe(outputStream);

    const expectedResult = [
      { ...personWithGender1 },
      { ...personWithGender2 },
      { ...personWithGender3 },
    ];

    underTest
      .on("end", () => {
        expect(outputStream.written()).toEqual(expectedResult);
        mockGenderizeAPI.verify(
          (instance) => instance.genderize(It.isAny()),
          Times.exactly(3));
        done();
      });
  });

  it("should return default values when genderize api throws error", (done) => {
    const personWithGender1 = { name: "name1", gender: "male", probability: "0.97" };
    const personWithGender2 = { name: "name2", gender: "NP", probability: "0.0" };
    const personWithGender3 = { name: "name3", gender: "male", probability: "0.57" };

    mockGenderizeAPI.setup((instance) => instance
      .genderize(record1.name))
      .returns(() => Promise.resolve(personWithGender1));

    mockGenderizeAPI.setup((instance) => instance
      .genderize(record2.name))
      .returns(() => Promise.reject(new Error("fake error")));

    mockGenderizeAPI.setup((instance) => instance
      .genderize(record3.name))
      .returns(() => Promise.resolve(personWithGender3));

    const outputStream = TestOutStream.asObjectStream();

    TestInputStream
      .fromObjects<Person[]>(
        [record1, record2, record3],
      )
      .pipe(underTest)
      .pipe(outputStream);

    const expectedResult = [
      { ...personWithGender1 },
      { ...personWithGender2 },
      { ...personWithGender3 },
    ];

    underTest
      .on("end", () => {
        expect(outputStream.written()).toEqual(expectedResult);
        mockGenderizeAPI.verify(
          (instance) => instance.genderize(It.isAny()),
          Times.exactly(3));
        done();
      });
  });
});
