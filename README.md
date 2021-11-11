Embed Simple Analytics on your website.

## Install

Copy the `embed.js` dist file to your server.

Copy this code to your website:

```html
<canvas id="sa-chart" width="400" height="200"></canvas>

<script
  data-canvas-id="sa-chart"
  data-hostname="remoteok.com"
  data-start="2020-11-11"
  data-end="2021-11-11"
  data-y-max="60000"
  src="./dist/embed.js"
  onerror="document.getElementById(this.dataset.canvasId).style.display = 'none'"
></script>
```

### Development

During development:

```bash
npm run dev
```

Done? Run the build script

```
npm run build
```
