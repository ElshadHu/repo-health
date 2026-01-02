import { beforeAll, afterAll, afterEach } from "vitest";
beforeAll(() => {
  console.log("Test suite started");
});

afterEach(() => {
  console.log("Test case complete");
});

afterAll(() => {
  console.log("Test suite complete");
});
