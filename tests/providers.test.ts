import { describe, expect, it } from "vitest";
import { config } from "../src/config.js";
import { ApiError } from "../src/errors.js";
import { generateImage } from "../src/providers/image.js";
import { createRunwayTask } from "../src/providers/video.js";
import { readFileSync } from "node:fs";

describe("provider configuration", () => {
  it("reports missing OpenAI configuration without calling the network", async () => {
    if (config.openAiKey) return;
    await expect(generateImage({ prompt: "test", size: "1024x1024" }))
      .rejects.toBeInstanceOf(ApiError);
  });

  describe("database migrations", () => {
    it("contains reviewed required tables without duplicate definitions", () => {
      const initial = readFileSync("supabase/migrations/202610300001_initial.sql", "utf8");
      const compat = readFileSync("supabase/migrations/202610300002_assets_and_compatibility.sql", "utf8");
      for (const table of ["profiles", "projects", "generations", "credit_accounts", "credit_transactions", "generation_assets"]) {
        expect(initial + compat).toContain(`public.${table}`);
      }
      expect(initial.match(/create table if not exists public\.profiles/g)?.length).toBe(1);
      expect(compat.match(/create table if not exists public\.generation_assets/g)?.length).toBe(1);
    });
  });

  it("reports missing Runway configuration without calling the network", async () => {
    if (config.runwayKey) return;
    await expect(createRunwayTask({ prompt: "test" }))
      .rejects.toBeInstanceOf(ApiError);
  });
});
