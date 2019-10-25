import { Mock, Times } from "typemoq";
import { Application } from "../src/app";
import { GenderAssignerPipeline } from "../src/service/gender-assigner-pipeline";

describe("App module", () => {

    let underTest: Application;
    const pipeline = Mock.ofType<GenderAssignerPipeline>();

    beforeAll(() => {
        pipeline.setup((instance) => instance
            .assignGender())
            .returns(() => Promise.resolve({}));
        underTest = new Application(pipeline.object);
    });

    it("should call assign gender method when application starts", async () => {
        underTest.start();
        pipeline.verify(
            (instance) => instance.assignGender(),
            Times.once());
    });
});
