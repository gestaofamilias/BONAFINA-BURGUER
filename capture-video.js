/**
 * BONAFINA BURGUER — Captura de Frames para Stories 1080x1920
 * Gera frames PNG -> ffmpeg monta o vídeo final
 */

const puppeteer = require('puppeteer');
const path      = require('path');
const fs        = require('fs');

// ── Configurações ──────────────────────────────────────────────
const BASE_DIR   = path.resolve(__dirname);
const FRAMES_DIR = path.join(BASE_DIR, '_frames');
const HTML_FILE  = 'file:///' + BASE_DIR.replace(/\\/g, '/') + '/index.html';

// Viewport mobile (será escalado para 1080x1920 pelo ffmpeg)
const VIEWPORT_W = 540;
const VIEWPORT_H = 960;

// Vídeo final
const FPS          = 30;
const DURACAO_SEG  = 55;   // duração total do vídeo
const TOTAL_FRAMES = FPS * DURACAO_SEG;  // 1650 frames

// ── Helpers ────────────────────────────────────────────────────
function pad(n, z = 6) { return String(n).padStart(z, '0'); }

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Main ───────────────────────────────────────────────────────
(async () => {
  // Prepara pasta de frames
  if (fs.existsSync(FRAMES_DIR)) fs.rmSync(FRAMES_DIR, { recursive: true });
  fs.mkdirSync(FRAMES_DIR);

  console.log('🚀 Iniciando Puppeteer...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--allow-file-access-from-files',
      '--disable-features=TranslateUI',
      '--force-device-scale-factor=2',
    ],
    defaultViewport: {
      width:             VIEWPORT_W,
      height:            VIEWPORT_H,
      deviceScaleFactor: 2,   // retina → 1080x1920 nativos
    },
  });

  const page = await browser.newPage();

  // Desativa animações CSS pesadas e vídeos para captura limpa
  await page.evaluateOnNewDocument(() => {
    // Para vídeos de fundo (apenas congelamos, não removemos)
    document.addEventListener('DOMContentLoaded', () => {
      // Pausa vídeos para a captura não travar
      document.querySelectorAll('video').forEach(v => {
        v.pause();
        v.currentTime = 1.5; // mostra frame do meio
      });
      // Marca todos os reveals como visíveis imediatamente
      document.querySelectorAll('.reveal, .reveal-scale, .reveal-left, .reveal-right')
        .forEach(el => el.classList.add('visible'));
      // Remove loading screen
      const loading = document.getElementById('loading');
      if (loading) loading.remove();
    });
  });

  console.log('🌐 Abrindo apresentação...');
  await page.goto(HTML_FILE, { waitUntil: 'networkidle0', timeout: 30000 });

  // Aguarda fontes e imagens carregarem
  await sleep(3000);

  // Força todos os reveals visíveis e para os vídeos
  await page.evaluate(() => {
    document.querySelectorAll('.reveal, .reveal-scale, .reveal-left, .reveal-right')
      .forEach(el => el.classList.add('visible'));
    document.querySelectorAll('video').forEach(v => {
      v.pause();
      v.currentTime = 1.5;
    });
    const loading = document.getElementById('loading');
    if (loading) loading.remove();
  });

  await sleep(1000);

  // Altura total da página
  const pageHeight = await page.evaluate(() => document.body.scrollHeight);
  const viewH      = VIEWPORT_H;
  const scrollable  = pageHeight - viewH;

  console.log(`📐 Altura da página: ${pageHeight}px | Frames: ${TOTAL_FRAMES} | FPS: ${FPS}`);

  // ── Estratégia de scroll ──────────────────────────────────────
  // Fase 1: Hero (0–5s) — fica parado no topo
  // Fase 2: Scroll (5–50s) — percorre a página toda
  // Fase 3: CTA Final (50–55s) — fica parado no final

  const HOLD_TOP_SEG  = 5;
  const HOLD_BOT_SEG  = 5;
  const SCROLL_SEG    = DURACAO_SEG - HOLD_TOP_SEG - HOLD_BOT_SEG;

  const HOLD_TOP_FRAMES  = HOLD_TOP_SEG  * FPS;   // 150
  const HOLD_BOT_FRAMES  = HOLD_BOT_SEG  * FPS;   // 150
  const SCROLL_FRAMES    = SCROLL_SEG    * FPS;   // 1350

  // Suavização de easing para scroll
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  let frameIdx = 0;

  async function captureFrame(scrollY) {
    await page.evaluate(y => window.scrollTo(0, y), scrollY);
    const framePath = path.join(FRAMES_DIR, `frame_${pad(frameIdx)}.png`);
    await page.screenshot({ path: framePath, type: 'png' });
    frameIdx++;
    if (frameIdx % 30 === 0) {
      process.stdout.write(`\r⏺  Frame ${frameIdx}/${TOTAL_FRAMES} (scroll: ${Math.round(scrollY)}px)`);
    }
  }

  // Fase 1 — topo parado
  console.log('\n📍 Fase 1: Topo (Hero)...');
  for (let i = 0; i < HOLD_TOP_FRAMES; i++) {
    await captureFrame(0);
  }

  // Fase 2 — scroll suave
  console.log('\n📜 Fase 2: Scrollando a apresentação...');
  for (let i = 0; i < SCROLL_FRAMES; i++) {
    const t       = i / (SCROLL_FRAMES - 1);
    const eased   = easeInOutCubic(t);
    const scrollY = Math.round(eased * scrollable);
    await captureFrame(scrollY);
  }

  // Fase 3 — final parado
  console.log('\n📍 Fase 3: CTA Final...');
  for (let i = 0; i < HOLD_BOT_FRAMES; i++) {
    await captureFrame(scrollable);
  }

  await browser.close();

  console.log(`\n✅ ${frameIdx} frames capturados em: ${FRAMES_DIR}`);
  console.log('\n🎬 Gerando vídeo com ffmpeg...');

  // ── ffmpeg ────────────────────────────────────────────────────
  const { execSync } = require('child_process');

  const OUTPUT = path.join(BASE_DIR, 'BONAFINA_BURGUER_STORIES.mp4');

  const ffmpegCmd = [
    'ffmpeg', '-y',
    `-framerate ${FPS}`,
    `-i "${path.join(FRAMES_DIR, 'frame_%06d.png')}"`,
    '-vf "scale=1080:1920:flags=lanczos"',
    '-c:v libx264',
    '-preset slow',
    '-crf 18',
    '-pix_fmt yuv420p',
    '-movflags +faststart',
    `"${OUTPUT}"`,
  ].join(' ');

  console.log('⚙️  Comando ffmpeg:', ffmpegCmd);
  execSync(ffmpegCmd, { stdio: 'inherit' });

  console.log(`\n🎉 VÍDEO PRONTO: ${OUTPUT}`);
  console.log(`   Formato: 1080x1920 | ${FPS}fps | ~${DURACAO_SEG}s`);

  // Limpa frames temporários
  fs.rmSync(FRAMES_DIR, { recursive: true });
  console.log('🗑  Frames temporários removidos.');
})();
