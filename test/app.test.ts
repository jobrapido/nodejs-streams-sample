import { startRunner } from "../src/app";

describe("Main application", () => {

  it("should be able to be instantiated", () => {
    expect(startRunner).toBeDefined();
  });
});
