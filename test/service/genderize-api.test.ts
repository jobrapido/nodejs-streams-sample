import { RestClient } from "typed-rest-client";
import { It, Mock, Times } from "typemoq";
import { GenderizeAPI } from "../../src/service/genderize-api";
import { PersonWithGender } from "../../src/stream/types";

describe("genderize api test suite", () => {

    const mockRestClient = Mock.ofType(RestClient);

    const successResponse = {
        headers: {},
        statusCode: 200,
        result: {
          name: "fakeName",
          gender: "male",
          probability: "0.9",
        },
      };

    const unsuccessResponse = {
        headers: {},
        statusCode: 500,
        result: {},
      };

    afterEach(() => {
        mockRestClient.reset();
      });

    it("should return result from api when api call is successful", async () => {
        const underTest = new GenderizeAPI(mockRestClient.object);

        mockRestClient.setup((instance) => instance
        .get(It.isAnyString(), It.isAny()))
        .returns(() => Promise.resolve(successResponse));

        const result = await underTest.genderize("fakeName");

        mockRestClient.verify(
        (instance) => instance.get( "https://api.genderize.io?name=fakeName", { acceptHeader: "application/json" }),
        Times.once());

        const expected: PersonWithGender = {name: "fakeName", gender: "male", probability: "0.9"};

        expect(result).toStrictEqual(expected);
    });

    it("should return result from api when api call is successful", (done) => {
        const underTest = new GenderizeAPI(mockRestClient.object);

        mockRestClient.setup((instance) => instance
        .get(It.isAnyString(), It.isAny()))
        .returns(() => Promise.resolve(unsuccessResponse));

        underTest.genderize("fakeName")
        .then(() => done(new Error("Should fail!")))
        .catch((error) => {

            mockRestClient.verify(
                (instance) => instance.get( "https://api.genderize.io?name=fakeName",
                { acceptHeader: "application/json" }),
                Times.once());

            expect(error).toBeDefined();
            done();
        });
    });
});
