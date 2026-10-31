# UI Avatar API

A lightweight, serverless avatar generator that turns names into clean, customisable **SVG avatars**. Use it in websites, dashboards, apps, and user profiles—no image uploads required.

**Live site and documentation:** https://ui-avatars.netlify.app/  
**API endpoint:** https://ui-avatars.netlify.app/api/

## Preview

![Avatar for Saad Masood](https://ui-avatars.netlify.app/api/?name=Saad%20Masood&background=2563eb&color=ffffff&size=128)
![Avatar for John Doe](https://ui-avatars.netlify.app/api/?name=John%20Doe&background=111827&color=ffffff&size=128)
![Avatar for Alex](https://ui-avatars.netlify.app/api/?name=Alex&background=059669&color=ffffff&size=128)

## Features

- **Initials from names:** first and last words for multi-word names (`Saad Masood` → `SM`).
- **Single-word support:** first two characters/graphemes (`Alex` → `AL`).
- **Custom colours:** set background and text colours with hexadecimal values.
- **Flexible size:** 16–512 pixels (default: 64).
- **Case control:** uppercase initials by default; optionally preserve original casing.
- **SVG output:** crisp at different display sizes and easy to embed.
- **Serverless deployment:** powered by Node.js and Netlify Functions.
- **No account required:** request an avatar using a URL.

## Quick start

Add an image element to your HTML:

```html
<img
  src="https://ui-avatars.netlify.app/api/?name=Saad%20Masood"
  alt="Saad Masood avatar"
  width="64"
  height="64"
/>
```

Or customise it:

```html
<img
  src="https://ui-avatars.netlify.app/api/?name=Jane%20Doe&size=128&background=7c3aed&color=ffffff"
  alt="Jane Doe avatar"
/>
```

## API reference

**Method:** `GET`  
**Endpoint:** `https://ui-avatars.netlify.app/api/`  
**Response:** `image/svg+xml`

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | String | Empty | Name used to generate initials. |
| `size` | Number | `64` | SVG width and height, clamped to `16`–`512`. |
| `background` | Hex colour | Random | Background colour; accepts 3- or 6-digit hex, with or without `#`. |
| `color` | Hex colour | `ffffff` | Text colour; accepts 3- or 6-digit hex, with or without `#`. |
| `uppercase` | Boolean-like string | `true` | Set to `false` to preserve the original case of initials. |

### Initials rules

| Input | Output |
| --- | --- |
| `Saad Masood` | `SM` |
| `John Michael Smith` | `JS` |
| `Alex` | `AL` |
| `A` | `A` |
| `john doe` | `JD` |
| `john doe&uppercase=false` | `jd` |

Initials are extracted using JavaScript's `Intl.Segmenter` for grapheme-aware splitting. SVG text rendering still depends on the fonts available to the viewer, so some complex scripts and symbols may render differently across devices.

### Examples

**Default avatar**

```text
https://ui-avatars.netlify.app/api/?name=Saad%20Masood
```

**Custom colours**

```text
https://ui-avatars.netlify.app/api/?name=Jane%20Doe&background=7c3aed&color=fff
```

**Larger avatar**

```text
https://ui-avatars.netlify.app/api/?name=John%20Smith&size=256
```

**Preserve case**

```text
https://ui-avatars.netlify.app/api/?name=john%20doe&uppercase=false
```

> Tip: URL-encode user-provided names and parameters. A literal `#` in a colour value must be encoded as `%23`, or simply omit it.

## JavaScript integration

```js
function avatarUrl(name, options = {}) {
  const params = new URLSearchParams({ name, ...options });
  return `https://ui-avatars.netlify.app/api/?${params}`;
}

const image = document.querySelector('#profile-avatar');
image.src = avatarUrl('Saad Masood', {
  size: 128,
  background: '2563eb',
  color: 'ffffff'
});
```

## React integration

```jsx
function Avatar({ name, size = 64 }) {
  const params = new URLSearchParams({ name, size: String(size) });

  return (
    <img
      src={`https://ui-avatars.netlify.app/api/?${params}`}
      alt={`${name} avatar`}
      width={size}
      height={size}
      style={{ borderRadius: '50%' }}
    />
  );
}

export default Avatar;
```

## Run locally

```bash
git clone <your-repository-url>
cd <your-repository-directory>
npm install
```

To run the Netlify Function and its `/api/` rewrite locally, install or use the Netlify CLI:

```bash
npx netlify dev
```

Open the local URL printed by the CLI and append `/api/?name=Jane%20Doe`.

> The exact local startup command depends on your repository's `package.json` and `netlify.toml`. The Netlify CLI command above is the recommended way to test the deployed function route locally.

## Project structure

```text
avatar-generator/
├── netlify/
│   └── functions/
│       └── api.js       # SVG avatar generation endpoint
├── public/
│   ├── index.html       # Documentation and playground
│   └── test.html
├── server.js            # Local development server
├── netlify.toml         # Netlify configuration and routing
├── package.json
└── README.md
```

## Deployment

This project is deployed with **Netlify Functions**. Connect the repository to Netlify and ensure `netlify.toml` maps `/api/` to the `api` function. After deployment, your endpoint is available at:

```text
https://<your-site>.netlify.app/api/?name=Jane%20Doe
```

## Notes and limitations

- The API currently generates **SVG**, not PNG or WebP.
- Background colours are random by default; specify `background` for a consistent appearance.
- The API does not currently provide custom fonts, shapes, animations, or identity-verification features.
- SVG font rendering may vary between devices.
- No uptime or unlimited-usage guarantee is implied by this README.

## Roadmap

Potential future enhancements:

- Deterministic background colours based on names or stable seeds.
- Additional shapes and avatar styles.
- More font and international script support.
- Accessibility and contrast-aware colour selection.
- Bulk avatar generation.

## Contributing

Contributions, bug reports and feature requests are welcome. Open an issue describing the problem or proposed improvement, and include a reproducible example when reporting a bug.

## License

No license is specified here. Add a `LICENSE` file and update this section if you choose to make the source available under an open-source license.
