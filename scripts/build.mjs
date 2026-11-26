import { execFileSync } from "node:child_process"
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const root = new URL("..", import.meta.url).pathname
const metadataCid = "QmWiQE65tmpYzcokCheQmng2DCM33DEhjXcPB6PanwpAZo"
const gateways = (process.env.IPFS_GATEWAYS ?? "https://ipfs.filebase.io/ipfs,https://gateway.pinata.cloud/ipfs").split(",")
const crop = ["-crop", "80", "30", "780", "780", "-resize", "256", "256", "-q", "82", "-metadata", "none"]
const tokens = JSON.parse(readFileSync(join(root, "scripts/tokens.json"), "utf8"))
const cache = join(root, ".cache")
const out = join(root, "avatars")

const avatarName = (token) => String(token).padStart(5, "0")

async function fetchBytes(path) {
  let lastError
  for (let attempt = 0; attempt < 6; attempt++) {
    const gateway = gateways[attempt % gateways.length]
    try {
      const res = await fetch(`${gateway}/${path}`, { signal: AbortSignal.timeout(90_000) })
      if (res.ok) return Buffer.from(await res.arrayBuffer())
      lastError = new Error(`${gateway}/${path}: HTTP ${res.status}`)
    } catch (err) {
      lastError = err
    }
    await new Promise((resolve) => setTimeout(resolve, 2000 * (attempt + 1)))
  }
  throw lastError
}

async function source(token) {
  const file = join(cache, `${token}.png`)
  if (existsSync(file)) return file
  const meta = JSON.parse((await fetchBytes(`${metadataCid}/${token}`)).toString("utf8"))
  writeFileSync(file, await fetchBytes(meta.image.replace("ipfs://", "")))
  return file
}

mkdirSync(cache, { recursive: true })
rmSync(out, { recursive: true, force: true })
mkdirSync(out)
for (const token of tokens) {
  const input = await source(token)
  execFileSync("cwebp", ["-quiet", ...crop, input, "-o", join(out, `${avatarName(token)}.webp`)])
}
console.log(`${readdirSync(out).length} avatars written to avatars/`)
