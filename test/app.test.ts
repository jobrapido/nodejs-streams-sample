import { Mock, Times } from "typemoq";
import { Logger } from "winston";
import { Application } from "../src/app";
import { GenderAssignerPipeline } from "../src/gender-assigner-pipeline";

describe("App module", () => {

    let underTest: Application;
    const pipeline = Mock.ofType<GenderAssignerPipeline>();
    const logger = Mock.ofType<Logger>();

    beforeAll(() => {
        pipeline.setup((instance) => instance
            .assignGender())
            .returns(() => Promise.resolve({}));
        underTest = new Application(pipeline.object, logger.object);
    });

    it("should call assign gender method when application starts", async () => {
        underTest.start();
        pipeline.verify(
            (instance) => instance.assignGender(),
            Times.once());
    });
});
