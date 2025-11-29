import { readFile } from "fs/promises";
import yaml from "js-yaml";
import { GardenConfig } from "../types/garden.js";

export async function loadGardenConfig(path: string): Promise<GardenConfig> {
  const content = await readFile(path, "utf8");
  const parsed = yaml.load(content);

  if (!parsed || typeof parsed !== "object" || !("garden" in parsed)) {
    throw new Error("garden.config.yaml must export a root 'garden' section");
  }

  return parsed as GardenConfig;
}
