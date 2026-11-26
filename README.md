# openbee mfers avatars

300 [mfers](https://opensea.io/collection/mfers) by sartoshi as avatars for openbee workers. mfers are public domain (CC0), see [NOTICE.md](NOTICE.md).

## Behaviour

- Once installed, the plugin is enabled and new workers get a random mfer that no other worker uses yet. When all 300 are taken, mfers are reused.
- Pick another mfer, a random one, or go back to initials when you edit a worker.
- Existing workers keep their initials until you pick an avatar for them.
- Disable or uninstall the plugin and workers show their initials again. Their choice is kept, so the mfers come back when you enable or reinstall it.

Needs openbee 1.0.13 or later.

## Install

Install it from **Settings → Plugins → Marketplace**, or run:

```sh
openbee plugin install @theopenbee/avatars-mfers
```

## The images

Each image is a 780 × 780 crop around the head of the original 1000 × 1000 mfer, scaled to 256 × 256 WebP and named after its token id. The 300 token ids, spread evenly across the collection, are listed in `scripts/tokens.json`.

To rebuild them you need Node 20+ and `cwebp` (`brew install webp`):

```sh
npm run build
npm test
```

The build downloads the originals from IPFS into `.cache/`. Set `IPFS_GATEWAYS` (comma separated) to use other gateways.

## License

Scripts and tests: MIT. Images: CC0 1.0, see [NOTICE.md](NOTICE.md).
