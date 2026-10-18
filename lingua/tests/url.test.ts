import test from "node:test";
import assert from "node:assert/strict";
import { safeHttpUrl } from "../src/lib/url";

test("seules les adresses http(s) sont acceptées", () => {
  assert.equal(safeHttpUrl("https://www.example.com/a?b=1"), "https://www.example.com/a?b=1");
  assert.equal(safeHttpUrl("  http://example.com "), "http://example.com/");
  for (const bad of ["javascript:alert(1)", "JaVaScRiPt:alert(1)", "data:text/html,<script>1</script>", "file:///etc/passwd", "ftp://x.org", "vbscript:x", "//example.com", "example.com", "", "https://exa mple.com", "https://a.com/\nx"]) {
    assert.equal(safeHttpUrl(bad), null, bad);
  }
  assert.equal(safeHttpUrl(undefined), null);
});
