import { describe, expect, it } from "vitest";
import { config } from "../src/config.js";
import { ApiError } from "../src/errors.js";
import { generateImage } from "../src/providers/image.js";
import { createRunwayTask } from "../src/providers/video.js";

describe("provider configuration", () => {
  it("reports missing OpenAI configuration without calling the network", async () => {
    if (config.openAiKey) return;
    await expect(generateImage({ prompt: "test", size: "1024x1024" }))
      .rejects.toBeInstanceOf(ApiError);
  });


  it("reports missing Runway configuration without calling the network", async () => {
    if (config.runwayKey) return;
    await expect(createRunwayTask({ prompt: "test" }))
      .rejects.toBeInstanceOf(ApiError);
  });
});
