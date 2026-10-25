import { describe, expect, it } from "vitest";
import { isOwnMediaPath } from "./media";

describe("isOwnMediaPath", () => {
  const user = "a68ba8cc-3b7f-4f98-b53e-d0932995438e";

  it("accepts files in the user's folder", () => {
    expect(isOwnMediaPath(user, `${user}/covers/x.webp`, "covers")).toBe(true);
  });

  it("rejects other users, other folders and traversal", () => {
    expect(isOwnMediaPath(user, `other/covers/x.webp`, "covers")).toBe(false);
    expect(isOwnMediaPath(user, `${user}/avatars/x.webp`, "covers")).toBe(false);
    expect(isOwnMediaPath(user, `${user}/covers/../../x.webp`, "covers")).toBe(false);
  });
});
