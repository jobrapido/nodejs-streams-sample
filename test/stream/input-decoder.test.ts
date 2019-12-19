import { InputDecoderTransformStream } from "../../src/stream/input-decoder";
import { TestInputStream } from "../test-stream";

describe("input decoder transform stream test suite", () => {

    it("should decode input correctly", (done) => {
        const underTest = new InputDecoderTransformStream();
        TestInputStream
            .fromObjects(
                ["name1"],
                ["name2"],
                ["name3"],
                ["name4"],
            )
            .pipe(underTest);

        const expected = [
            { name: "name1" },
            { name: "name2" },
            { name: "name3" },
            { name: "name4" },
        ];
        const results: any[] = [];

        underTest
            .on("data", (buffer) => results.push(buffer))
            .on("end", () => {
                expect(results).toEqual(expected);
                done();
            });
    });

    it("should decode input correctly", (done) => {
        const underTest = new InputDecoderTransformStream();
        TestInputStream
            .fromObjects(
                ["name1"],
                [""],
                ["name3"],
                [""],
            )
            .pipe(underTest);

        const expected = [
            { name: "name1" },
            { name: "name3" },
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
