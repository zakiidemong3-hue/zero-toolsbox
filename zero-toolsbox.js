#!/usr/bin/env node
/* ============================================================
   ZERO TOOLBOX — Multi-Feature CLI Utility
   Run: node zero-toolbox.js
   ============================================================ */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

// ========== CONFIG ==========
const CONFIG = {
  DATA_DIR: path.join(process.env.HOME || process.env.USERPROFILE || '.', '.zero-toolbox'),
  LOG_FILE: 'history.log',
  NOTES_FILE: 'notes.txt',
  OPENWEATHER_API: 'https://api.open-meteo.com/v1/forecast',
  IP_API: 'https://ipapi.co',
  URL_SHORT_API: 'https://tinyurl.com/api-create.php',
};

// Init data dir
if (!fs.existsSync(CONFIG.DATA_DIR)) {
  fs.mkdirSync(CONFIG.DATA_DIR, { recursive: true });
}

// ========== COLORS ==========
const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
  blue: '\x1b[34m', magenta: '\x1b[35m', cyan: '\x1b[36m',
  white: '\x1b[37m', gray: '\x1b[90m',
  bgRed: '\x1b[41m', bgGreen: '\x1b[42m', bgBlue: '\x1b[44m',
};
const c = (code, text) => `${code}${text}${C.reset}`;
const bold = t => c(C.bold, t);
const dim = t => c(C.dim, t);
const cyan = t => c(C.cyan, t);
const green = t => c(C.green, t);
const yellow = t => c(C.yellow, t);
const red = t => c(C.red, t);
const magenta = t => c(C.magenta, t);
const blue = t => c(C.blue, t);
const gray = t => c(C.gray, t);

// ========== READLINE ==========
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function ask(q) { return new Promise(resolve => rl.question(q, resolve)); }
function closeRL() { console.log(gray('\nGoodbye! 👋')); rl.close(); process.exit(0); }

// ========== LOGGER ==========
function logToFile(text) {
  const logPath = path.join(CONFIG.DATA_DIR, CONFIG.LOG_FILE);
  const entry = `[${new Date().toISOString()}] ${text}\n`;
  fs.appendFileSync(logPath, entry);
}

// ========== HEADER ==========
function clearScreen() { process.stdout.write('\x1b[2J\x1b[H'); }

function printHeader() {
  clearScreen();
  console.log(cyan('╭────────────────────────────────────────────╮'));
  console.log(cyan('│') + bold('  ⚡ ZERO TOOLBOX v2.0') + cyan('                      │'));
  console.log(cyan('│') + dim('  Multi-feature CLI Utility for Termux') + cyan('        │'));
  console.log(cyan('╰────────────────────────────────────────────╯'));
  console.log('');
}

// ========== SPINNER ==========
class Spinner {
  constructor(text) {
    this.text = text;
    this.frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    this.idx = 0;
    this.interval = null;
  }
  start() {
    process.stdout.write('\x1b[?25l');
    this.interval = setInterval(() => {
      process.stdout.write('\r' + cyan(this.frames[this.idx]) + ' ' + this.text + '   ');
      this.idx = (this.idx + 1) % this.frames.length;
    }, 80);
  }
  stop(text) {
    clearInterval(this.interval);
    process.stdout.write('\r' + ' '.repeat(this.text.length + 10) + '\r');
    process.stdout.write('\x1b[?25h');
    if (text) console.log(green('✓') + ' ' + text);
  }
}

// ========== MAIN MENU ==========
async function mainMenu() {
  printHeader();
  console.log(bold('Select a tool:'));
  console.log('');
  console.log(`  ${cyan('[1]')}  🔐  Password Generator`);
  console.log(`  ${cyan('[2]')}  🔗  URL Shortener`);
  console.log(`  ${cyan('[3]')}  📡  IP Tracker & Lookup`);
  console.log(`  ${cyan('[4]')}  🌤   Weather Check`);
  console.log(`  ${cyan('[5]')}  🔍  Text Tools (Base64, Hash)`);
  console.log(`  ${cyan('[6]')}  🎨  ASCII Art Generator`);
  console.log(`  ${cyan('[7]')}  📊  System Monitor`);
  console.log(`  ${cyan('[8]')}  🌐  Internet Speed Test`);
  console.log(`  ${cyan('[9]')}  🔔  Countdown Timer`);
  console.log(`  ${cyan('[10]')} 📝  Quick Notes`);
  console.log(`  ${cyan('[11]')} 📋  View History Log`);
  console.log(`  ${cyan('[0]')}  Exit`);
  console.log('');

  const choice = await ask(gray('› ') + 'Choose: ');

  switch (choice.trim()) {
    case '1': await passwordGenerator(); break;
    case '2': await urlShortener(); break;
    case '3': await ipTracker(); break;
    case '4': await weatherCheck(); break;
    case '5': await textTools(); break;
    case '6': await asciiArt(); break;
    case '7': await systemMonitor(); break;
    case '8': await speedTest(); break;
    case '9': await countdownTimer(); break;
    case '10': await quickNotes(); break;
    case '11': await viewHistory(); break;
    case '0': closeRL(); break;
    default:
      console.log(red('Invalid option!'));
      await ask(gray('Press Enter to continue...'));
      await mainMenu();
  }
}

// ========== 1. PASSWORD GENERATOR ==========
async function passwordGenerator() {
  printHeader();
  console.log(bold('🔐 Password Generator'));
  console.log(gray('─'.repeat(45)));
  console.log('');

  const length = parseInt(await ask(cyan('?') + ' Password length (8-64): ')) || 16;
  const useUpper = (await ask(cyan('?') + ' Include uppercase? (y/n): ')).toLowerCase() === 'y';
  const useNumbers = (await ask(cyan('?') + ' Include numbers? (y/n): ')).toLowerCase() === 'y';
  const useSymbols = (await ask(cyan('?') + ' Include symbols? (y/n): ')).toLowerCase() === 'y';

  let chars = 'abcdefghijklmnopqrstuvwxyz';
  if (useUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (useNumbers) chars += '0123456789';
  if (useSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let password = '';
  for (let i = 0; i < Math.min(Math.max(length, 8), 64); i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }

  console.log('');
  console.log(bold('Generated Password:'));
  console.log(green('  ' + password));
  console.log('');
  logToFile(`Password generated: ${password}`);
  await ask(gray('Press Enter to continue...'));
  await mainMenu();
}

// ========== 2. URL SHORTENER ==========
async function urlShortener() {
  printHeader();
  console.log(bold('🔗 URL Shortener'));
  console.log(gray('─'.repeat(45)));
  console.log('');

  const url = await ask(cyan('?') + ' Enter URL to shorten: ');

  if (!url.startsWith('http')) {
    console.log(red('✗ Invalid URL! Must start with http:// or https://'));
    await ask(gray('Press Enter to continue...'));
    return await mainMenu();
  }

  const spinner = new Spinner('Shortening URL...');
  spinner.start();

  try {
    const res = await fetch(`${CONFIG.URL_SHORT_API}?url=${encodeURIComponent(url)}`);
    const shortUrl = await res.text();
    spinner.stop('Done!');
    console.log('');
    console.log(bold('Short URL:'));
    console.log(green('  ' + shortUrl));
    logToFile(`URL shortened: ${url} → ${shortUrl}`);
  } catch {
    spinner.stop(null);
    // Fallback: pake is.gd
    try {
      const res = await fetch(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`);
      const shortUrl = await res.text();
      console.log('');
      console.log(bold('Short URL:'));
      console.log(green('  ' + shortUrl));
      logToFile(`URL shortened: ${url} → ${shortUrl}`);
    } catch {
      console.log(red('✗ Failed to shorten URL. Check your internet.'));
    }
  }

  console.log('');
  await ask(gray('Press Enter to continue...'));
  await mainMenu();
}

// ========== 3. IP TRACKER ==========
async function ipTracker() {
  printHeader();
  console.log(bold('📡 IP Tracker & Lookup'));
  console.log(gray('─'.repeat(45)));
  console.log('');

  const target = await ask(cyan('?') + ' IP or domain (leave empty for your IP): ') || '';

  const spinner = new Spinner('Fetching data...');
  spinner.start();

  try {
    const query = target.trim() ? target.trim() : '';
    const url = query ? `${CONFIG.IP_API}/${query}/json/` : `${CONFIG.IP_API}/json/`;
    const res = await fetch(url);
    const data = await res.json();
    spinner.stop('Done!');
    console.log('');
    console.log(bold('IP Info:'));
    console.log(`  IP        : ${cyan(data.ip || 'N/A')}`);
    console.log(`  City      : ${data.city || 'N/A'}`);
    console.log(`  Region    : ${data.region || 'N/A'}`);
    console.log(`  Country   : ${data.country_name || 'N/A'} (${data.country || ''})`);
    console.log(`  ISP       : ${data.org || 'N/A'}`);
    console.log(`  Timezone  : ${data.timezone || 'N/A'}`);
    console.log(`  Lat/Long  : ${data.latitude || '?'}, ${data.longitude || '?'}`);
    logToFile(`IP tracked: ${data.ip} - ${data.city}, ${data.country_name}`);
  } catch {
    spinner.stop(null);
    console.log(red('✗ Failed to fetch IP data.'));
  }

  console.log('');
  await ask(gray('Press Enter to continue...'));
  await mainMenu();
}

// ========== 4. WEATHER ==========
async function weatherCheck() {
  printHeader();
  console.log(bold('🌤 Weather Check'));
  console.log(gray('─'.repeat(45)));
  console.log('');

  const city = await ask(cyan('?') + ' Enter city name: ');
  if (!city.trim()) {
    console.log(red('✗ City name required!'));
    await ask(gray('Press Enter to continue...'));
    return await mainMenu();
  }

  const spinner = new Spinner('Fetching weather...');
  spinner.start();

  try {
    // Geocode city to coordinates
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city.trim())}&count=1&language=en`);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      spinner.stop(null);
      console.log(red('✗ City not found!'));
      await ask(gray('Press Enter to continue...'));
      return await mainMenu();
    }

    const { latitude, longitude, name, country } = geoData.results[0];
    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`);
    const weatherData = await weatherRes.json();
    const current = weatherData.current;

    const weatherCodes = {
      0: '☀️ Clear', 1: '🌤 Mostly Clear', 2: '⛅ Partly Cloudy', 3: '☁️ Cloudy',
      45: '🌫 Fog', 51: '🌦 Drizzle', 61: '🌧 Rain', 71: '❄️ Snow', 95: '⛈ Thunderstorm'
    };

    spinner.stop('Done!');
    console.log('');
    console.log(bold(`Weather in ${name}, ${country}:`));
    console.log(`  🌡  Temp     : ${yellow(current.temperature_2m + '°C')}`);
    console.log(`  💧 Humidity : ${cyan(current.relative_humidity_2m + '%')}`);
    console.log(`  🌬  Wind     : ${current.wind_speed_10m} km/h`);
    console.log(`  📋 Condition: ${weatherCodes[current.weather_code] || 'Unknown'}`);
    logToFile(`Weather: ${name} - ${current.temperature_2m}°C, ${weatherCodes[current.weather_code] || 'N/A'}`);
  } catch {
    spinner.stop(null);
    console.log(red('✗ Failed to fetch weather.'));
  }

  console.log('');
  await ask(gray('Press Enter to continue...'));
  await mainMenu();
}

// ========== 5. TEXT TOOLS ==========
async function textTools() {
  printHeader();
  console.log(bold('🔍 Text Tools'));
  console.log(gray('─'.repeat(45)));
  console.log('');
  console.log(`  ${cyan('[1]')} Base64 Encode`);
  console.log(`  ${cyan('[2]')} Base64 Decode`);
  console.log(`  ${cyan('[3]')} MD5 Hash`);
  console.log(`  ${cyan('[4]')} SHA256 Hash`);
  console.log(`  ${cyan('[5]')} SHA512 Hash`);
  console.log(`  ${cyan('[6]')} Random UUID`);
  console.log(`  ${cyan('[7]')} Word Count`);
  console.log('');

  const choice = await ask(gray('› ') + 'Choose: ');
  const text = await ask(cyan('?') + ' Enter text: ');

  let result = '';
  switch (choice.trim()) {
    case '1': result = Buffer.from(text).toString('base64'); break;
    case '2': result = Buffer.from(text, 'base64').toString('utf-8'); break;
    case '3': result = crypto.createHash('md5').update(text).digest('hex'); break;
    case '4': result = crypto.createHash('sha256').update(text).digest('hex'); break;
    case '5': result = crypto.createHash('sha512').update(text).digest('hex'); break;
    case '6': result = crypto.randomUUID(); break;
    case '7': result = `Characters: ${text.length}, Words: ${text.split(/\s+/).filter(Boolean).length}, Lines: ${text.split('\n').length}`; break;
    default: result = red('Invalid option'); break;
  }

  console.log('');
  console.log(bold('Result:'));
  console.log(green('  ' + result));
  logToFile(`Text tool: ${result}`);

  console.log('');
  await ask(gray('Press Enter to continue...'));
  await mainMenu();
}

// ========== 6. ASCII ART ==========
async function asciiArt() {
  printHeader();
  console.log(bold('🎨 ASCII Art Generator'));
  console.log(gray('─'.repeat(45)));
  console.log('');

  const text = await ask(cyan('?') + ' Enter text: ');
  if (!text.trim()) {
    console.log(red('✗ Text required!'));
    await ask(gray('Press Enter to continue...'));
    return await mainMenu();
  }

  // Simple ASCII banner font (5x7)
  const font = {
    'A': [' ██╗ ', '██╔██╗', '╚═╝██║', '██╗██║', '╚═╝╚═╝'],
    'B': ['████╗ ', '██╔██╗', '████╔╝', '██╔██╗', '████╔╝'],
    'C': [' ███╗', '██╔██╗', '██║╚═╝', '██║██╗', '╚███╔╝'],
    'D': ['████╗ ', '██╔██╗', '██║██║', '██╔██║', '████╔╝'],
    'E': ['████╗', '██╔═╝', '████╗', '██╔═╝', '████╗'],
    'F': ['████╗', '██╔═╝', '████╗', '██╔═╝', '██║  '],
    'G': [' ███╗', '██╔═╝ ', '██║██╗', '██╔██║', '╚███╔╝'],
    'H': ['██╗██╗', '██║██║', '█████║', '██╔██║', '██║██║'],
    'I': ['██╗', '██║', '██║', '██║', '██║'],
    'J': ['  ██╗', '  ██║', '  ██║', '██╔╝ ', '╚═╝  '],
    'K': ['██╗██╗', '██╔╝╚╝', '██║  ', '██╔╝  ', '██║   '],
    'L': ['██╗  ', '██║  ', '██║  ', '██║  ', '████╗'],
    'M': ['██╗██╗', '██║██║', '█████║', '██╔██║', '██║██║'],
    'N': ['██╗██╗', '███╗█║', '██║██║', '██║██║', '██║██║'],
    'O': [' ███╗', '██╔██╗', '██║██║', '██╚██║', '╚███╔╝'],
    'P': ['████╗', '██╔██╗', '████╔╝', '██╔═╝ ', '██║   '],
    'Q': [' ███╗', '██╔██╗', '██║██║', '██╚██║', ' ╚██║'],
    'R': ['████╗', '██╔██╗', '████╔╝', '██╔██╗', '██║╚██'],
    'S': [' ███╗', '██╔═╝ ', ' ██╔╝ ', '██╔═╝ ', ' ██║  '],
    'T': ['█████╗', ' ╚██╔╝ ', '  ██║  ', '  ██║  ', '  ╚═╝  '],
    'U': ['██╗██╗', '██║██║', '██║██║', '██╚██║', '╚███╔╝'],
    'V': ['██╗██╗', '██║██║', '╚═╝██║', '██╗██║', '╚═╝╚═╝'],
    'W': ['██╗╗██╗', '██║██╔╝', '██╔██╔╝', '██╔╝██╗', '╚═╝ ╚═╝'],
    'X': ['██╗╚██╗', '██║██║', '╚═╝██║', '██╗██║', '╚═╝╚═╝'],
    'Y': ['██╗ ╚██╗', '╚██╗██║', ' ╚███╔╝', ' ██╔██╗', ' ╚═╝ ╚═╝'],
    'Z': ['█████╗', '╚══██║', '  ██╔╝', '██╔╝  ', '█████╗'],
    ' ': ['  ', '  ', '  ', '  ', '  '],
    '!': ['██╗', '██║', '██║', '╚═╝ ', '██╗'],
    '0': [' ███╗', '██╔██╗', '██║██║', '██╔██║', '╚███╔╝'],
    '1': [' ██╗ ', '███║ ', ' ██║ ', ' ██║ ', '████╗'],
    '2': ['████╗', '╚═██║', ' ██╔╝', '██╔╝ ', '████╗'],
    '3': ['████╗', '╚═██║', ' ██╔╝', '╚═██║', '████╗'],
    '4': ['██╗██╗', '██║██║', '█████║', '╚═╝██║', '   ╚═╝'],
    '5': ['████╗', '██╔═╝', '████╗', '╚═██║', '████╗'],
    '6': [' ███╗', '██╔═╝', '████╗', '██╔██╗', '╚███╔╝'],
    '7': ['█████', '╚══██', '  ██╗', '  ██║', '  ╚═╝'],
    '8': [' ███╗', '██╔██╗', ' ██╔╝', '██╔██╗', '╚███╔╝'],
    '9': [' ███╗', '██╔██╗', '╚███╔╝', '╚═██║', ' ██╔╝'],
    '.': ['  ', '  ', '  ', '  ', '██╗'],
    '-': ['    ', '    ', '████', '    ', '    '],
  };

  const upper = text.toUpperCase();
  let lines = ['', '', '', '', ''];
  for (const ch of upper) {
    const glyph = font[ch] || font[' '];
    for (let i = 0; i < 5; i++) {
      lines[i] += glyph[i] + ' ';
    }
  }

  console.log('');
  console.log(cyan(lines.join('\n')));
  logToFile(`ASCII art generated for: ${text}`);

  console.log('');
  await ask(gray('Press Enter to continue...'));
  await mainMenu();
}

// ========== 7. SYSTEM MONITOR ==========
async function systemMonitor() {
  printHeader();
  console.log(bold('📊 System Monitor'));
  console.log(gray('─'.repeat(45)));
  console.log('');

  // CPU
  const cpus = os.cpus();
  const cpuModel = cpus[0]?.model || 'Unknown';
  const cpuCores = cpus.length;

  // Memory
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memPercent = ((usedMem / totalMem) * 100).toFixed(1);

  // Uptime
  const uptime = os.uptime();
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const mins = Math.floor((uptime % 3600) / 60);

  // Storage (Termux home)
  let storageInfo = 'N/A';
  try {
    const home = process.env.HOME;
    const { execSync } = require('child_process');
    const df = execSync(`df -h ${home}`).toString();
    const lines = df.split('\n');
    if (lines.length > 1) {
      const parts = lines[1].split(/\s+/);
      storageInfo = `${parts[2] || '?'} used / ${parts[1] || '?'} total`;
    }
  } catch {}

  console.log(bold('System Info:'));
  console.log(`  🖥  Hostname  : ${cyan(os.hostname())}`);
  console.log(`  ⚙️  CPU       : ${cpuModel}`);
  console.log(`  🔢 Cores     : ${cpuCores}`);
  console.log(`  📦 Arch      : ${os.arch()}`);
  console.log(`  💻 Platform  : ${os.platform()} ${os.release()}`);
  console.log('');
  console.log(bold('Memory:'));
  const memBar = '█'.repeat(Math.floor(memPercent / 5)) + '░'.repeat(20 - Math.floor(memPercent / 5));
  console.log(`  ${memBar} ${yellow(memPercent + '%')}`);
  console.log(`  Used : ${(usedMem / 1073741824).toFixed(1)} GB / ${(totalMem / 1073741824).toFixed(1)} GB`);
  console.log('');
  console.log(bold('Uptime:'));
  console.log(`  ${days}d ${hours}h ${mins}m`);
  console.log('');
  console.log(bold('Storage (Termux):'));
  console.log(`  ${storageInfo}`);
  logToFile(`System monitor: CPU ${cpuModel}, RAM ${memPercent}%, Uptime ${days}d ${hours}h`);

  console.log('');
  await ask(gray('Press Enter to continue...'));
  await mainMenu();
}

// ========== 8. SPEED TEST ==========
async function speedTest() {
  printHeader();
  console.log(bold('🌐 Internet Speed Test'));
  console.log(gray('─'.repeat(45)));
  console.log('');

  const spinner = new Spinner('Testing download speed...');
  spinner.start();

  try {
    // Download small file to test speed
    const start = Date.now();
    const res = await fetch('https://speed.cloudflare.com/__down?bytes=1048576'); // 1MB
    const data = await res.arrayBuffer();
    const end = Date.now();
    const duration = (end - start) / 1000; // seconds
    const mb = data.byteLength / 1048576;
    const speed = (mb / duration * 8).toFixed(1); // Mbps

    spinner.stop('Done!');
    console.log('');
    console.log(bold('Speed Test Results:'));
    console.log(`  ⬇  Download : ${green(speed + ' Mbps')}`);
    console.log(`  📦 Size     : ${mb.toFixed(1)} MB`);
    console.log(`  ⏱  Time     : ${duration.toFixed(2)} seconds`);
    console.log('');
    if (speed > 50) console.log(green('  🚀 Excellent speed!'));
    else if (speed > 20) console.log(yellow('  👍 Good speed!'));
    else console.log(red('  🐢 Slow connection!'));
    logToFile(`Speed test: ${speed} Mbps`);
  } catch {
    spinner.stop(null);
    console.log(red('✗ Failed to test speed. Check your internet.'));
  }

  console.log('');
  await ask(gray('Press Enter to continue...'));
  await mainMenu();
}

// ========== 9. COUNTDOWN TIMER ==========
async function countdownTimer() {
  printHeader();
  console.log(bold('🔔 Countdown Timer'));
  console.log(gray('─'.repeat(45)));
  console.log('');

  const seconds = parseInt(await ask(cyan('?') + ' Enter seconds: ')) || 0;
  if (seconds <= 0 || seconds > 3600) {
    console.log(red('✗ Enter a number between 1 and 3600!'));
    await ask(gray('Press Enter to continue...'));
    return await mainMenu();
  }

  console.log('');
  console.log(bold(`Timer set for ${seconds} seconds...`));
  console.log(gray('Press Ctrl+C to cancel'));
  console.log('');

  let remaining = seconds;
  const interval = setInterval(() => {
    process.stdout.write('\r' + cyan('⏳ ') + ` ${remaining}s remaining... `);
    remaining--;
    if (remaining < 0) {
      clearInterval(interval);
      process.stdout.write('\r' + ' '.repeat(40) + '\r');
      console.log(green('🔔 TIME\'S UP! 🔔'));
      console.log('');
      // Beep
      process.stdout.write('\x07');
      logToFile(`Timer finished: ${seconds}s`);
    }
  }, 1000);

  await new Promise(resolve => setTimeout(resolve, (seconds + 1) * 1000));

  console.log('');
  await ask(gray('Press Enter to continue...'));
  await mainMenu();
}

// ========== 10. QUICK NOTES ==========
async function quickNotes() {
  printHeader();
  console.log(bold('📝 Quick Notes'));
  console.log(gray('─'.repeat(45)));
  console.log('');

  const notesPath = path.join(CONFIG.DATA_DIR, CONFIG.NOTES_FILE);

  // Show existing notes
  if (fs.existsSync(notesPath)) {
    const existing = fs.readFileSync(notesPath, 'utf-8');
    if (existing.trim()) {
      console.log(bold('Existing Notes:'));
      console.log(gray('─'.repeat(45)));
      console.log(existing);
      console.log(gray('─'.repeat(45)));
      console.log('');
    }
  }

  console.log(`  ${cyan('[1]')} Add new note`);
  console.log(`  ${cyan('[2]')} Clear all notes`);
  console.log(`  ${cyan('[3]')} Back to menu`);
  console.log('');

  const choice = await ask(gray('› ') + 'Choose: ');

  switch (choice.trim()) {
    case '1':
      console.log('');
      console.log(dim('Type your note (press Enter twice to finish):'));
      console.log('');
      const note = await ask(gray('› '));
      fs.appendFileSync(notesPath, `[${new Date().toLocaleString()}] ${note}\n`);
      console.log(green('✓ Note saved!'));
      logToFile(`Note added: ${note}`);
      break;
    case '2':
      fs.writeFileSync(notesPath, '');
      console.log(green('✓ All notes cleared!'));
      break;
    case '3': return await mainMenu();
  }

  console.log('');
  await ask(gray('Press Enter to continue...'));
  await quickNotes();
}

// ========== 11. VIEW HISTORY ==========
async function viewHistory() {
  printHeader();
  console.log(bold('📋 History Log'));
  console.log(gray('─'.repeat(45)));
  console.log('');

  const logPath = path.join(CONFIG.DATA_DIR, CONFIG.LOG_FILE);
  if (fs.existsSync(logPath)) {
    const log = fs.readFileSync(logPath, 'utf-8');
    if (log.trim()) {
      console.log(log);
    } else {
      console.log(dim('No history yet.'));
    }
  } else {
    console.log(dim('No history yet.'));
  }

  console.log('');
  await ask(gray('Press Enter to continue...'));
  await mainMenu();
}

// ========== START ==========
process.on('SIGINT', () => {
  console.log('');
  console.log(gray('\nGoodbye! 👋'));
  rl.close();
  process.exit(0);
});

mainMenu().catch(err => {
  console.error(red('Error:'), err);
  closeRL();
});
