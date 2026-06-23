import path from "node:path";

export function uploadRoot() {
  return process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");
}

export function safeJoinUploadPath(...parts: string[]) {
  const root = uploadRoot();
  const resolved = path.resolve(root, ...parts);

  if (!resolved.startsWith(path.resolve(root))) {
    throw new Error("Ruta de archivo no valida.");
  }

  return resolved;
}

export function extensionFromMime(mimeType: string) {
  const extensions: Record<string, string> = {
    "image/gif": ".gif",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
  };

  return extensions[mimeType] ?? "";
}
