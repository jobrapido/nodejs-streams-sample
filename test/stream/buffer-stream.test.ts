import { Mock } from "typemoq";
import { Logger } from "winston";
import { BufferTransformStream } from "../../src/stream/buffer-stream";
import { TestInputStream } from "../test-stream";

describe("buffer transform stream test suite", () => {

    const logger = Mock.ofType<Logger>();

    it("should buffer correctly", (done) => {
        const underTest = new BufferTransformStream(2, logger.object);
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
        const underTest = new BufferTransformStream(3, logger.object);
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
