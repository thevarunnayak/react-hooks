import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9222;
const USER_DATA_DIR = '/tmp/chrome-light-profile-' + Date.now();

const SCREENSHOTS = [
  { url: 'http://localhost:5174/', output: 'docs/screenshots/home.png' },
  { url: 'http://localhost:5174/#playground', output: 'docs/screenshots/playground.png' },
  { url: 'http://localhost:5174/#playground', output: 'docs/screenshots/layout_studio.png', preAction: 'layout_studio' },
  { url: 'http://localhost:5174/#custom-hooks', output: 'docs/screenshots/custom_hooks.png' },
  { url: 'http://localhost:5174/#challenges', output: 'docs/screenshots/challenges.png' },
  { url: 'http://localhost:5174/#machine-coding', output: 'docs/screenshots/machine_coding_catalog.png' },
  { url: 'http://localhost:5174/#machine-coding/code-editor', output: 'docs/screenshots/machine_coding_lab.png' },
  { url: 'http://localhost:5174/#machine-coding/rich-text-editor', output: 'docs/screenshots/rich_text_editor.png' },
  { url: 'http://localhost:5174/#machine-coding/drag-drop-board', output: 'docs/screenshots/kanban_board_lab.png' },
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sendCommand(ws, method, params = {}) {
  const id = Math.floor(Math.random() * 1000000);
  return new Promise((resolve, reject) => {
    const handler = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      } catch (e) {
        reject(e);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function main() {
  console.log('Launching headless Chrome...');
  const chromeProcess = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${USER_DATA_DIR}`,
    '--window-size=1440,900',
    '--hide-scrollbars',
  ]);

  // Wait for Chrome to be ready
  let ready = false;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) {
        ready = true;
        break;
      }
    } catch {}
    await sleep(300);
  }

  if (!ready) {
    console.error('Failed to connect to Chrome on port ' + PORT);
    chromeProcess.kill();
    process.exit(1);
  }

  console.log('Connected to Chrome!');

  for (const item of SCREENSHOTS) {
    console.log(`\nCapturing [Light Mode]: ${item.url} -> ${item.output}`);
    
    // Create new tab
    const newTabRes = await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(item.url)}`, { method: 'PUT' });
    const tabInfo = await newTabRes.json();
    const wsUrl = tabInfo.webSocketDebuggerUrl;

    const ws = new WebSocket(wsUrl);
    await new Promise((resolve) => {
      ws.addEventListener('open', resolve, { once: true });
    });

    // Enable Page & Emulation
    await sendCommand(ws, 'Page.enable');
    await sendCommand(ws, 'Runtime.enable');
    await sendCommand(ws, 'Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-color-scheme', value: 'light' }],
    });
    await sendCommand(ws, 'Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });

    // Force light theme in localStorage and DOM
    await sendCommand(ws, 'Runtime.evaluate', {
      expression: `
        try {
          localStorage.setItem('react-hooks-theme', JSON.stringify('light'));
          document.documentElement.setAttribute('data-theme', 'light');
        } catch(e) {}
      `,
    });

    // Navigate or reload to ensure light theme is applied
    await sendCommand(ws, 'Page.navigate', { url: item.url });
    await sleep(2500);

    // If layout studio is needed, click the layout studio tab button
    if (item.preAction === 'layout_studio') {
      await sendCommand(ws, 'Runtime.evaluate', {
        expression: `
          const buttons = Array.from(document.querySelectorAll('button'));
          const layoutBtn = buttons.find(b => b.textContent.includes('Layout & Flex Studio') || b.textContent.includes('Layout Studio'));
          if (layoutBtn) layoutBtn.click();
        `,
      });
      await sleep(1500);
    }

    // Re-verify light theme attribute
    await sendCommand(ws, 'Runtime.evaluate', {
      expression: `
        document.documentElement.setAttribute('data-theme', 'light');
        document.body.setAttribute('data-theme', 'light');
      `,
    });
    await sleep(800);

    // Capture screenshot
    const screenshotResult = await sendCommand(ws, 'Page.captureScreenshot', {
      format: 'png',
      quality: 100,
      fromSurface: true,
    });

    const buffer = Buffer.from(screenshotResult.data, 'base64');
    const outDir = path.dirname(item.output);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    fs.writeFileSync(item.output, buffer);
    console.log(`Saved ${buffer.length} bytes to ${item.output}`);

    ws.close();
    // Close tab
    await fetch(`http://127.0.0.1:${PORT}/json/close/${tabInfo.id}`);
  }

  chromeProcess.kill();
  console.log('\nAll Light Mode screenshots successfully generated!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
