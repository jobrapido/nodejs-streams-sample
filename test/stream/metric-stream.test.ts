import * as lolex from "lolex";
import { ApplicationConfig } from "../../src/config";
import { MetricStream } from "../../src/stream/metric-stream";
import { TestInputStream } from "../test-stream";

describe("metric transform stream test suite", () => {

  let clock: lolex.Clock;

  beforeEach(() => {
    clock = lolex.install({ now: 0 });
  });

  it(`given a sampleRate and an stream of objects
  should emit metrics event with the expected throughput and
  should not tamper the stream of objects`, (done) => {

    const appConfig = new ApplicationConfig();

    const underTest = new MetricStream(appConfig);

    const objectStream = [
      ["record1"],
      ["record2"],
      ["record3"],
      ["record4"],
      ["record5"],
      ["record6"],
      ["record7"],
      ["record8"],
      ["record9"],
      ["record10"]];

    TestInputStream
      .fromObjects(...objectStream)
      .pipe(underTest);

    const results: any[] = [];

    const expectedThroughput = 2.0;
    const tick = (appConfig.SAMPLE_SIZE * 1000) / (expectedThroughput * (appConfig.SAMPLE_SIZE - 1));

    underTest
      .on("data", (buffer) => {
        clock.tick(tick);
        results.push(buffer);
      })
      .on("metrics", (throughput: number) => {
        expect(throughput).toBe(expectedThroughput.toFixed(3));
      })
      .on("end", () => {
        expect(results).toEqual(objectStream);
        done();
      });
  });
});
