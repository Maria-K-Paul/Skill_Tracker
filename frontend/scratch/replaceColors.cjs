const fs = require('fs');
const path = require('path');

const srcDir = path.join(process.cwd(), 'src');

function mapColor(colorGroup) {
  if (['green', 'emerald'].includes(colorGroup)) return 'success';
  if (['red', 'rose'].includes(colorGroup)) return 'destructive';
  if (['amber', 'yellow'].includes(colorGroup)) return 'warning';
  if (['blue', 'sky', 'cyan'].includes(colorGroup)) return 'info';
  if (['purple', 'violet'].includes(colorGroup)) return 'primary';
  return colorGroup;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace text-{color}-{weight}
  content = content.replace(/text-(green|emerald|red|amber|yellow|blue|sky|purple)-(?:[1-9]00)(?:\/(\d+))?/g, (match, color, opacity) => {
    const sem = mapColor(color);
    return opacity ? `text-${sem}/${opacity}` : `text-${sem}`;
  });

  // Replace bg-{color}-{weight}
  content = content.replace(/bg-(green|emerald|red|amber|yellow|blue|sky|purple)-(50|100|200)(?:\/(\d+))?/g, (match, color, weight, opacity) => {
    const sem = mapColor(color);
    // for light backgrounds, use 10% opacity if not specified
    let newOpacity = opacity || (weight === '50' ? '10' : '20');
    return `bg-${sem}/${newOpacity}`;
  });

  content = content.replace(/bg-(green|emerald|red|amber|yellow|blue|sky|purple)-(400|500|600|700|800|900)(?:\/(\d+))?/g, (match, color, weight, opacity) => {
    const sem = mapColor(color);
    if (weight === '900' || weight === '950') { // often used as dark background
      return opacity ? `bg-${sem}/${opacity}` : `bg-${sem}/30`;
    }
    return opacity ? `bg-${sem}/${opacity}` : `bg-${sem}`;
  });

  // Replace border-{color}-{weight}
  content = content.replace(/border-(green|emerald|red|amber|yellow|blue|sky|purple)-(200|300|400)(?:\/(\d+))?/g, (match, color, weight, opacity) => {
    const sem = mapColor(color);
    return opacity ? `border-${sem}/${opacity}` : `border-${sem}/30`;
  });
  content = content.replace(/border-(green|emerald|red|amber|yellow|blue|sky|purple)-(500|600|700|800|900)(?:\/(\d+))?/g, (match, color, weight, opacity) => {
    const sem = mapColor(color);
    return opacity ? `border-${sem}/${opacity}` : `border-${sem}`;
  });

  // Replace from-{color}-{weight} and to-{color}-{weight}
  content = content.replace(/from-(green|emerald|red|amber|yellow|blue|sky|purple)-(?:[1-9]00)(?:\/(\d+))?/g, (match, color, opacity) => {
    const sem = mapColor(color);
    return opacity ? `from-${sem}/${opacity}` : `from-${sem}`;
  });
  content = content.replace(/to-(green|emerald|red|amber|yellow|blue|sky|purple)-(?:[1-9]00)(?:\/(\d+))?/g, (match, color, opacity) => {
    const sem = mapColor(color);
    return opacity ? `to-${sem}/${opacity}` : `to-${sem}`;
  });

  // Replace ring-{color}-{weight}
  content = content.replace(/ring-(green|emerald|red|amber|yellow|blue|sky|purple)-(?:[1-9]00)(?:\/(\d+))?/g, (match, color, opacity) => {
    const sem = mapColor(color);
    return opacity ? `ring-${sem}/${opacity}` : `ring-${sem}`;
  });

  // Replace fill-{color}-{weight}
  content = content.replace(/fill-(green|emerald|red|amber|yellow|blue|sky|purple)-(?:[1-9]00)(?:\/(\d+))?/g, (match, color, opacity) => {
    const sem = mapColor(color);
    return opacity ? `fill-${sem}/${opacity}` : `fill-${sem}`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

walk(srcDir);
