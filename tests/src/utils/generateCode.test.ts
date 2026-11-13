
import { describe, it, expect } from "vitest";

import {
  generateSixDigitCode
} from "../../../src/utils/generateCode.util";

describe("Generate code utilities", () => {

  it("should return a string", () => {
    const code = generateSixDigitCode();

    expect(typeof code).toBe("string");
  });

  it("should generate a six digit code", () => {
    const code = generateSixDigitCode();

    expect(code).toMatch(/^\d{6}$/);
  });

  it("should generate a code between 100000 and 999999", () => {
    const code = generateSixDigitCode();

    expect(Number(code)).toBeGreaterThanOrEqual(100000);
    expect(Number(code)).toBeLessThanOrEqual(999999);
  });

  it("should generate valid codes multiple times", () => {
    for (let i = 0; i < 100; i++) {
      const code = generateSixDigitCode();

      expect(code).toMatch(/^\d{6}$/);
    }
  });

});
