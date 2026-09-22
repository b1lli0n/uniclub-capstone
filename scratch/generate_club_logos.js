const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

function createPng(width, height, drawFn) {
  const rawData = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + width * 4);
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawFn(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = Math.min(255, Math.max(0, Math.round(r)));
      rawData[pxOffset + 1] = Math.min(255, Math.max(0, Math.round(g)));
      rawData[pxOffset + 2] = Math.min(255, Math.max(0, Math.round(b)));
      rawData[pxOffset + 3] = Math.min(255, Math.max(0, Math.round(a)));
    }
  }

  const idatData = zlib.deflateSync(rawData);

  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let j = 0; j < 8; j++) {
        c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
      }
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const crcVal = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(crcVal, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idatData),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

// Helper drawing functions
function dist(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
  if (l2 === 0) return dist(px, py, x1, y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return dist(px, py, x1 + t * (x2 - x1), y1 + t * (y2 - y1));
}

// 12 Club Logo Generators
const LOGO_CONFIGS = {
  'gaming_club_logo.png': {
    bg1: [126, 34, 206], // #7e22ce
    bg2: [88, 28, 135],  // #581c87
    ring: [192, 132, 252],
    isIcon: (x, y) => {
      // Game controller body: rounded rect with two grips
      // Center around (100, 100)
      const cx = 100, cy = 95;
      // Main body: capsule
      const inBody = (Math.abs(x - cx) <= 38 && Math.abs(y - cy) <= 22) ||
                     (dist(x, y, cx - 36, cy) <= 22) ||
                     (dist(x, y, cx + 36, cy) <= 22) ||
                     // Left grip
                     (dist(x, y, cx - 34, cy + 22) <= 16) ||
                     // Right grip
                     (dist(x, y, cx + 34, cy + 22) <= 16);
      if (!inBody) return false;

      // Cutout between grips at bottom
      if (Math.abs(x - cx) < 18 && y > cy + 10) return false;

      // Inner details: D-pad on left (cx - 24, cy)
      const dpadX = cx - 24, dpadY = cy;
      const inDpadHoriz = Math.abs(x - dpadX) <= 10 && Math.abs(y - dpadY) <= 3.5;
      const inDpadVert = Math.abs(x - dpadX) <= 3.5 && Math.abs(y - dpadY) <= 10;
      if (inDpadHoriz || inDpadVert) return 'detail';

      // 4 Action buttons on right (cx + 24, cy)
      const btnX = cx + 24, btnY = cy;
      const b1 = dist(x, y, btnX, btnY - 7) <= 3;
      const b2 = dist(x, y, btnX + 7, btnY) <= 3;
      const b3 = dist(x, y, btnX, btnY + 7) <= 3;
      const b4 = dist(x, y, btnX - 7, btnY) <= 3;
      if (b1 || b2 || b3 || b4) return 'detail';

      // Center logo / buttons
      if (dist(x, y, cx - 7, cy - 4) <= 2.2 || dist(x, y, cx + 7, cy - 4) <= 2.2) return 'detail';

      return true;
    }
  },

  'music_club_logo.png': {
    bg1: [234, 88, 12],  // #ea580c
    bg2: [194, 65, 12],  // #c2410c
    ring: [253, 186, 116],
    isIcon: (x, y) => {
      // Two eighth notes connected by a beam
      // Left note head at (78, 122), right note head at (122, 112)
      const head1 = dist(x, y, 78, 122) <= 13;
      const head2 = dist(x, y, 122, 112) <= 13;
      if (head1 || head2) return true;

      // Left stem: (87, 120) to (87, 68)
      const stem1 = Math.abs(x - 87) <= 3.5 && y >= 65 && y <= 120;
      // Right stem: (131, 110) to (131, 58)
      const stem2 = Math.abs(x - 131) <= 3.5 && y >= 55 && y <= 110;
      if (stem1 || stem2) return true;

      // Beam connecting stems: from (85, 65) to (133, 55)
      const beamDist = distToSegment(x, y, 85, 68, 133, 58);
      if (beamDist <= 6) return true;
      // Secondary beam
      const beam2Dist = distToSegment(x, y, 85, 80, 133, 70);
      if (beam2Dist <= 4.5) return true;

      return false;
    }
  },

  'coding_club_logo.png': {
    bg1: [29, 78, 216],  // #1d4ed8
    bg2: [30, 58, 138],  // #1e3a8a
    ring: [147, 197, 253],
    isIcon: (x, y) => {
      // < / > brackets
      // Left bracket <
      const left1 = distToSegment(x, y, 78, 100, 60, 100);
      const d1 = distToSegment(x, y, 82, 80, 58, 100);
      const d2 = distToSegment(x, y, 58, 100, 82, 120);
      if (d1 <= 5 || d2 <= 5) return true;

      // Slash /
      const dSlash = distToSegment(x, y, 108, 76, 92, 124);
      if (dSlash <= 5) return true;

      // Right bracket >
      const d3 = distToSegment(x, y, 118, 80, 142, 100);
      const d4 = distToSegment(x, y, 142, 100, 118, 120);
      if (d3 <= 5 || d4 <= 5) return true;

      return false;
    }
  },

  'dance_club_logo.png': {
    bg1: [219, 39, 119], // #db2777
    bg2: [157, 23, 77],  // #9d174d
    ring: [244, 180, 206],
    isIcon: (x, y) => {
      // Dancer silhouette
      // Head
      if (dist(x, y, 100, 68) <= 10) return true;
      // Torso & arms
      const spine = distToSegment(x, y, 100, 78, 104, 110);
      if (spine <= 7) return true;
      // Left arm up-curved
      const armL = distToSegment(x, y, 98, 84, 72, 68);
      if (armL <= 5) return true;
      // Right arm extended
      const armR = distToSegment(x, y, 102, 84, 130, 78);
      if (armR <= 5) return true;
      // Left leg
      const legL = distToSegment(x, y, 104, 110, 85, 140);
      if (legL <= 6) return true;
      // Right leg kicked back
      const legR = distToSegment(x, y, 104, 110, 132, 124);
      if (legR <= 6) return true;

      return false;
    }
  },

  'basketball_club_logo.png': {
    bg1: [234, 88, 12],  // #ea580c
    bg2: [154, 52, 18],  // #9a3412
    ring: [253, 186, 116],
    isIcon: (x, y) => {
      // Basketball outline & seams
      const r = dist(x, y, 100, 100);
      if (r > 42) return false;
      // Lines inside ball
      // Horizontal seam
      if (Math.abs(y - 100) <= 2.5) return 'detail';
      // Vertical seam
      if (Math.abs(x - 100) <= 2.5) return 'detail';
      // Curved left seam
      const leftCurve = Math.abs(dist(x, y, 62, 100) - 34);
      if (leftCurve <= 2.5) return 'detail';
      // Curved right seam
      const rightCurve = Math.abs(dist(x, y, 138, 100) - 34);
      if (rightCurve <= 2.5) return 'detail';

      return true;
    }
  },

  'chess_club_logo.png': {
    bg1: [180, 83, 9],   // #b45309
    bg2: [120, 53, 15],  // #78350f
    ring: [253, 230, 138],
    isIcon: (x, y) => {
      // Chess King / Knight Crown
      // Base
      if (Math.abs(x - 100) <= 32 && y >= 126 && y <= 136) return true;
      if (Math.abs(x - 100) <= 26 && y >= 118 && y <= 126) return true;
      // Body
      const bodyDist = distToSegment(x, y, 100, 118, 100, 80);
      const halfWidth = 14 + (y - 80) * 0.25;
      if (y >= 80 && y <= 118 && Math.abs(x - 100) <= halfWidth) return true;
      // Crown head
      if (dist(x, y, 100, 78) <= 14) return true;
      // Cross on top
      if (Math.abs(x - 100) <= 3 && y >= 56 && y <= 72) return true;
      if (Math.abs(y - 62) <= 3 && x >= 93 && x <= 107) return true;

      return false;
    }
  },

  'debate_club_logo.png': {
    bg1: [13, 148, 136], // #0d9488
    bg2: [17, 94, 89],   // #115e59
    ring: [153, 246, 228],
    isIcon: (x, y) => {
      // Two speech bubbles
      // Bubble 1 (top-left)
      const b1 = (Math.abs(x - 88) <= 24 && Math.abs(y - 85) <= 16) || dist(x, y, 68, 85) <= 16 || dist(x, y, 108, 85) <= 16;
      // Tail 1
      const tail1 = x >= 72 && x <= 86 && y >= 96 && y <= 112 && (x - 72) > (y - 96);
      if (b1 || tail1) return true;

      // Bubble 2 (bottom-right)
      const b2 = (Math.abs(x - 116) <= 20 && Math.abs(y - 110) <= 14) || dist(x, y, 100, 110) <= 14 || dist(x, y, 132, 110) <= 14;
      const tail2 = x >= 122 && x <= 134 && y >= 120 && y <= 132;
      if (b2 || tail2) return 'detail';

      return false;
    }
  },

  'environmental_club_logo.png': {
    bg1: [5, 150, 105],  // #059669
    bg2: [6, 95, 70],    // #065f46
    ring: [167, 243, 208],
    isIcon: (x, y) => {
      // Stylized leaf
      // Arc from (100, 60) to (100, 135)
      const dC1 = dist(x, y, 68, 100);
      const dC2 = dist(x, y, 132, 100);
      const inLeaf = (dC1 <= 44 && dC2 <= 44);
      if (!inLeaf) return false;

      // Central stem
      const stemDist = distToSegment(x, y, 100, 62, 100, 138);
      if (stemDist <= 2.5) return 'detail';

      // Side veins
      const v1 = distToSegment(x, y, 100, 85, 118, 76);
      const v2 = distToSegment(x, y, 100, 98, 82, 88);
      const v3 = distToSegment(x, y, 100, 112, 118, 102);
      if (v1 <= 1.8 || v2 <= 1.8 || v3 <= 1.8) return 'detail';

      return true;
    }
  },

  'film_club_logo.png': {
    bg1: [109, 40, 217], // #6d28d9
    bg2: [76, 29, 149],  // #4c1d95
    ring: [196, 181, 253],
    isIcon: (x, y) => {
      // Clapperboard
      // Bottom body
      const inBody = x >= 68 && x <= 132 && y >= 96 && y <= 136;
      if (inBody) return true;
      // Top clapper bar (tilted)
      const clapper = distToSegment(x, y, 66, 90, 134, 76);
      if (clapper <= 8) {
        // Stripes on clapper
        const proj = (x - 66) * 0.98 + (y - 90) * (-0.2);
        if (Math.floor(proj / 14) % 2 === 0) return 'detail';
        return true;
      }
      return false;
    }
  },

  'photography_club_logo.png': {
    bg1: [71, 85, 105],  // #475569
    bg2: [30, 41, 59],   // #1e293b
    ring: [203, 213, 225],
    isIcon: (x, y) => {
      // Camera
      // Top flash/prism
      if (x >= 88 && x <= 112 && y >= 68 && y <= 78) return true;
      // Main camera body
      const inBody = (Math.abs(x - 100) <= 36 && Math.abs(y - 106) <= 24);
      if (inBody) {
        // Lens outer ring
        const rLens = dist(x, y, 100, 106);
        if (rLens <= 18 && rLens >= 14) return 'detail';
        if (rLens <= 8) return 'detail';
        // Viewfinder
        if (dist(x, y, 124, 92) <= 3) return 'detail';
        return true;
      }
      return false;
    }
  },

  'startup_club_logo.png': {
    bg1: [220, 38, 38],  // #dc2626
    bg2: [153, 27, 27],  // #991b1b
    ring: [254, 202, 202],
    isIcon: (x, y) => {
      // Rocket angled up-right
      // Rocket tip (130, 70), base (80, 120)
      const axisDist = distToSegment(x, y, 132, 68, 82, 118);
      const t = ((x - 82) * 50 + (y - 118) * (-50)) / 5000;
      if (t >= 0 && t <= 1) {
        const width = 16 * Math.sin(t * Math.PI);
        if (axisDist <= width) {
          // Window
          if (dist(x, y, 108, 92) <= 4.5) return 'detail';
          return true;
        }
      }
      // Left fin
      const fin1 = distToSegment(x, y, 86, 114, 68, 126);
      if (fin1 <= 4) return true;
      // Right fin
      const fin2 = distToSegment(x, y, 86, 114, 98, 144);
      if (fin2 <= 4) return true;

      // Flame
      if (dist(x, y, 76, 124) <= 5) return 'detail';
      if (dist(x, y, 70, 130) <= 3.5) return 'detail';

      return false;
    }
  },

  'volunteer_club_logo.png': {
    bg1: [225, 29, 72],  // #e11d48
    bg2: [159, 18, 57],  // #9f1239
    ring: [254, 205, 211],
    isIcon: (x, y) => {
      // Heart shape in center
      // Parametric heart: (x-100), (y-95)
      const nx = (x - 100) / 32;
      const ny = -(y - 95) / 32; // Invert y so top is positive
      // (x^2 + y^2 - 1)^3 - x^2 * y^3 <= 0
      const a = nx * nx + ny * ny - 1;
      const inHeart = a * a * a - nx * nx * ny * ny * ny <= 0;
      if (inHeart) return true;

      // Supporting hands under the heart
      const handL = distToSegment(x, y, 68, 124, 92, 128);
      const handR = distToSegment(x, y, 132, 124, 108, 128);
      if (handL <= 4 || handR <= 4) return true;

      return false;
    }
  }
};

// Generate each file
const targets = [
  path.join(__dirname, '..', 'uniclub-frontend', 'public', 'uploads', 'clubs'),
  path.join(__dirname, '..', 'uniclub-backend', 'uploads', 'clubs'),
];

for (const [filename, config] of Object.entries(LOGO_CONFIGS)) {
  const png = createPng(200, 200, (x, y, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    const r = dist(x, y, cx, cy);

    // Outside main circle: transparent
    if (r > 94) {
      return [0, 0, 0, 0];
    }

    // Outer anti-aliasing edge
    let alpha = 255;
    if (r > 92) {
      alpha = Math.round((94 - r) / 2 * 255);
    }

    // Outer border ring
    if (r >= 86 && r <= 92) {
      return [...config.ring, alpha];
    }

    // Inner subtle glow ring
    if (r >= 82 && r < 86) {
      const t = (r - 82) / 4;
      const col = config.bg1.map((c, i) => Math.round(c * (1 - t) + config.ring[i] * t));
      return [...col, alpha];
    }

    // Icon check
    const iconResult = config.isIcon(x, y);
    if (iconResult === true) {
      // Main icon color: Crisp White
      return [255, 255, 255, alpha];
    } else if (iconResult === 'detail') {
      // Secondary detail color: Subtle accent
      return [...config.ring, alpha];
    }

    // Background gradient: top-left to bottom-right
    const gradT = ((x + y) / (w + h));
    const rCol = Math.round(config.bg1[0] * (1 - gradT) + config.bg2[0] * gradT);
    const gCol = Math.round(config.bg1[1] * (1 - gradT) + config.bg2[1] * gradT);
    const bCol = Math.round(config.bg1[2] * (1 - gradT) + config.bg2[2] * gradT);

    return [rCol, gCol, bCol, alpha];
  });

  for (const dir of targets) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const fullPath = path.join(dir, filename);
    fs.writeFileSync(fullPath, png);
  }
  console.log(`Generated: ${filename} (${png.length} bytes)`);
}

console.log('All 12 club logos successfully generated!');
