import { Mock } from "typemoq";
import { ApplicationConfig } from "../../src/config";
import { BufferTransformStream } from "../../src/stream/buffer-stream";
import { TestInputStream } from "../test-stream";

describe("buffer transform stream test suite", () => {

    it("should buffer correctly", (done) => {
        const configs = Mock.ofType(ApplicationConfig);
        configs.setup((instance) => instance.BUFFER_SIZE).returns(() => 2);

        const underTest = new BufferTransformStream(configs.object);
        TestInputStream
            .fromObjects(
                { name: "name1" },
                { name: "name2" },
                { name: "name3" },
                { name: "name4" },
            )
            .pipe(underTest);

        const expected = [
            [{ name: "name1" }, { name: "name2" }],
            [{ name: "name3" }, { name: "name4" }],
        ];
        const results: any[] = [];

        underTest
            .on("data", (buffer) => results.push(buffer))
            .on("end", () => {
                expect(results).toEqual(expected);
                done();
            });
    });

    it("should flush correctly", (done) => {
        const configs = Mock.ofType(ApplicationConfig);
        configs.setup((instance) => instance.BUFFER_SIZE).returns(() => 3);

        const underTest = new BufferTransformStream(configs.object);
        TestInputStream
            .fromObjects(
                { name: "name1" },
                { name: "name2" },
                { name: "name3" },
                { name: "name4" },
            )
            .pipe(underTest);

        const expected = [
            [{ name: "name1" }, { name: "name2" }, { name: "name3" }],
            [{ name: "name4" }],
        ];
        const results: any[] = [];

        underTest
            .on("data", (buffer) => results.push(buffer))
            .on("end", () => {
                expect(results).toEqual(expected);
                done();
            });
    });
});
