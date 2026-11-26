import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync, readdirSync, statSync } from "node:fs"

const url = (path) => new URL(`../${path}`, import.meta.url)
const read = (path) => readFileSync(url(path), "utf8")
const manifest = JSON.parse(read("openbee.plugin.json"))
const pkg = JSON.parse(read("package.json"))
const tokens = JSON.parse(read("scripts/tokens.json"))
const files = readdirSync(url("avatars")).filter((f) => !f.startsWith("."))

test("the manifest declares an avatar plugin without a process", () => {
  assert.equal(manifest.protocol_version, 1)
  assert.equal(manifest.type, "avatar")
  assert.equal(manifest.id, "mfers")
  assert.equal(manifest.avatars, "avatars")
  assert.equal(manifest.command, undefined)
  assert.equal(manifest.config, undefined)
  assert.equal(manifest.setup, undefined)
})

test("the package ships the manifest, icon, notice and every avatar", () => {
  for (const file of ["openbee.plugin.json", "icon.svg", "avatars", "NOTICE.md"]) assert.ok(pkg.files.includes(file), file)
})

test("there is one 256px WebP avatar per listed mfer", () => {
  assert.equal(tokens.length, 300)
  assert.equal(new Set(tokens).size, tokens.length)
  const names = tokens.map((t) => `${String(t).padStart(5, "0")}.webp`).sort()
  assert.deepEqual([...files].sort(), names)
  for (const file of files) {
    const data = readFileSync(url(`avatars/${file}`))
    assert.equal(data.subarray(0, 4).toString("latin1"), "RIFF", file)
    assert.equal(data.subarray(8, 12).toString("latin1"), "WEBP", file)
    assert.ok(statSync(url(`avatars/${file}`)).size <= 256 * 1024, file)
  }
})

test("the manifest ships a one-colour SVG icon", () => {
  assert.equal(manifest.icon, "icon.svg")
  const icon = read("icon.svg")
  assert.match(icon, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)
  assert.match(icon, /currentColor/)
  assert.doesNotMatch(icon, /#[0-9a-f]{3,6}\b/i)
  assert.ok(icon.length <= 32 * 1024)
})
