import { randomUUID } from "node:crypto";

export interface DemoAsset {
  id: string;
  name: string;
  mimeType: string;
  buffer: Buffer;
}

const assets = new Map<string, DemoAsset>();

export function storeDemoAsset(name: string, mimeType: string, buffer: Buffer): DemoAsset {
  const asset = { id: randomUUID(), name, mimeType, buffer };
  assets.set(asset.id, asset);
  return asset;
}

export function getDemoAsset(id: string): DemoAsset | undefined {
  return assets.get(id);
}

export function deleteDemoAsset(id: string): void {
  assets.delete(id);
}
