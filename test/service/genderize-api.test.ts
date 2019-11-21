import * as lolex from "lolex";
import { RestClient } from "typed-rest-client";
import { It, Mock, Times } from "typemoq";
import { ApplicationConfig } from "../../src/config";
import { GenderizeAPI } from "../../src/service/genderize-api";
import { PersonWithGender } from "../../src/stream/types";

describe("genderize api test suite", () => {

    let clock: lolex.Clock;
    const mockRestClient = Mock.ofType(RestClient);
    const configs = Mock.ofType(ApplicationConfig);
    configs.setup((instance) => instance.MAX_SERP_REQUESTS_PER_SECONDS).returns(() => 1);

    const successResponse = {
        headers: {},
        statusCode: 200,
        result: {
          name: "fakeName",
          gender: "male",
          probability: "0.9",
        },
      };

    const failureResponse = {
        headers: {},
        statusCode: 500,
        result: {},
      };

    let underTest: GenderizeAPI;

    beforeEach(() => {
        const now = Date.now();
        clock = lolex.install({ now });

        mockRestClient
          .setup((instance) => instance.get(It.isAnyString(), It.isAny()))
          .returns(() => Promise.resolve(successResponse));

        underTest = new GenderizeAPI(mockRestClient.object, configs.object);
      });

    afterEach(() => {
        mockRestClient.reset();
        clock.uninstall();
      });

    it("should return result from api when api call is successful", async () => {
        const promise = underTest.genderize("fakeName");
        clock.tick(1000);

        mockRestClient.verify(
        (instance) => instance.get( "https://api.genderize.io?name=fakeName", { acceptHeader: "application/json" }),
        Times.once());

        const response = await promise;
        const expected: PersonWithGender = {name: "fakeName", gender: "male", probability: "0.9"};

        expect(response).toStrictEqual(expected);
    });

    it("should return result from api when api call is successful", (done) => {
        const mockFailingClient = Mock.ofType(RestClient);
        mockFailingClient
          .setup((instance) => instance.get(It.isAny(), It.isAny()))
          .returns(() => Promise.resolve(failureResponse));

        // tslint:disable-next-line:no-shadowed-variable
        const underTest = new GenderizeAPI(mockFailingClient.object, configs.object);

        underTest.genderize("fakeName")
        .then(() => done(new Error("Should fail!")))
        .catch((error) => {

            mockFailingClient.verify(
                (instance) => instance.get( "https://api.genderize.io?name=fakeName",
                { acceptHeader: "application/json" }),
                Times.once());

            expect(error).toBeDefined();
            done();
        });
        clock.tick(1000);
    });

    it("should limit calls to serp service", async () => {
        const multipleRequestsMockClient = Mock.ofType(RestClient);
        multipleRequestsMockClient
          .setup((instance) => instance.get(It.isAny(), It.isAny()))
          .returns(() => Promise.resolve(successResponse));

        multipleRequestsMockClient
          .setup((instance) => instance.get(It.isAny(), It.isAny()))
          .returns(() => Promise.resolve(successResponse));

        multipleRequestsMockClient
          .setup((instance) => instance.get(It.isAny(), It.isAny()))
          .returns(() => Promise.resolve(successResponse));

        // tslint:disable-next-line:no-shadowed-variable
        const underTest = new GenderizeAPI(multipleRequestsMockClient.object, configs.object);

        const promises = [
          underTest.genderize("fakeName1"),
          underTest.genderize("fakeName2"),
          underTest.genderize("fakeName3"),
        ];

        clock.tick(900);
        multipleRequestsMockClient.verify((instance) => instance.get(It.isAny(), It.isAny()), Times.once());
        clock.tick(1000);
        multipleRequestsMockClient.verify((instance) => instance.get(It.isAny(), It.isAny()), Times.exactly(2));
        clock.tick(1000);
        multipleRequestsMockClient.verify((instance) => instance.get(It.isAny(), It.isAny()), Times.exactly(3));

        await Promise.all(promises);
      });
});
