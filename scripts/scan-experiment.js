#!/usr/bin/env node
/**
 * Lightweight static scanner for new / changed experiments under `games/`.
 *
 * Purpose: surface anything risky for a maintainer to eyeball before merging.
 * Doesn't replace human review — it just highlights patterns that have caused
 * problems in similar community projects (data exfiltration, remote code
 * execution, sneaky tracking, deceptive permission requests).
 *
 * Exit code: 0 always (this is a notice, not a gate). Maintainer reads the
 * output in the PR check and decides.
 *
 * Usage:
 *   node scripts/scan-experiment.js
 *   node scripts/scan-experiment.js games/some-slug   # scope to one folder
 */

const fs = require('node:fs');
const path = require('node:path');

const RULES = [
  {
    id: 'external-fetch',
    label: 'fetch() with an external URL',
    pattern: /fetch\s*\(\s*['"`]https?:\/\/(?!localhost|127\.0\.0\.1)/g,
    why: "fetch() can exfiltrate user data. Confirm the destination is trusted (e.g. our CDN allowlist in next.config.mjs).",
  },
  {
    id: 'xhr',
    label: 'XMLHttpRequest',
    pattern: /XMLHttpRequest/g,
    why: "Same exfiltration concern as fetch(). Confirm trusted destinations.",
  },
  {
    id: 'remote-script',
    label: '<script src="http(s)://...">',
    pattern: /<script[^>]+src=['"]https?:\/\/(?!cdn\.jsdelivr\.net|unpkg\.com|fonts\.googleapis\.com)[^'"]+['"]/gi,
    why: "External script tag pulling code we haven't reviewed. The CSP will block most of these; surface them anyway for review.",
  },
  {
    id: 'eval',
    label: 'eval()',
    pattern: /\beval\s*\(/g,
    why: "eval can run attacker-controlled strings as code. Reject unless the experiment legitimately interprets a small DSL.",
  },
  {
    id: 'new-function',
    label: 'new Function(...)',
    pattern: /new\s+Function\s*\(/g,
    why: "Same risk as eval. Same review bar.",
  },
  {
    id: 'document-write',
    label: 'document.write',
    pattern: /document\.write\s*\(/g,
    why: "Often used for malvertising / injection. Almost always replaceable with safer DOM methods.",
  },
  {
    id: 'inner-html',
    label: 'innerHTML assignment',
    pattern: /\.innerHTML\s*=/g,
    why: "Can be an XSS vector if combined with user input. Verify the source is trusted or sanitized.",
  },
  {
    id: 'local-storage',
    label: 'localStorage / sessionStorage',
    pattern: /\b(localStorage|sessionStorage)\b/g,
    why: "Privacy concern. Storage should be declared in the experiment's description so visitors know what's tracked.",
  },
  {
    id: 'cookies',
    label: 'document.cookie',
    pattern: /document\.cookie/g,
    why: "Cookies imply persistent tracking. Declare in the description.",
  },
  {
    id: 'geolocation',
    label: 'navigator.geolocation',
    pattern: /navigator\.geolocation/g,
    why: "Geolocation requires explicit user consent and a clearly explained reason in the experiment UI.",
  },
  {
    id: 'media-devices',
    label: 'navigator.mediaDevices.getUserMedia',
    pattern: /getUserMedia\s*\(/g,
    why: "Camera or mic access. Confirm the experiment's tags justify it (the iframe Permissions Policy will block unjustified requests).",
  },
  {
    id: 'beacon',
    label: 'navigator.sendBeacon',
    pattern: /sendBeacon\s*\(/g,
    why: "Used by analytics pings. Confirm the destination is allowlisted.",
  },
  {
    id: 'web-rtc',
    label: 'WebRTC peer connection',
    pattern: /\bRTCPeerConnection\b/g,
    why: "Peer-to-peer connections can establish channels to arbitrary servers. Confirm the use case.",
  },
];

const ALLOWED_EXTERNAL_SCRIPT_HOSTS = [
  'cdn.jsdelivr.net',
  'unpkg.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'storage.googleapis.com',
];

function listFiles(root) {
  const out = [];
  if (!fs.existsSync(root)) return out;
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) {
      out.push(...listFiles(full));
    } else if (/\.(html|js|mjs|ts|tsx|jsx)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

function scanFile(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const findings = [];
  for (const rule of RULES) {
    const matches = text.match(rule.pattern);
    if (matches && matches.length > 0) {
      findings.push({
        rule: rule.id,
        label: rule.label,
        why: rule.why,
        count: matches.length,
        sample: matches[0].slice(0, 80),
      });
    }
  }
  return findings;
}

function main() {
  const arg = process.argv[2];
  const root = arg ? path.resolve(arg) : path.resolve(__dirname, '..', 'games');
  const files = listFiles(root).filter((f) => !f.includes(`${path.sep}_template${path.sep}`));

  if (files.length === 0) {
    console.log(`[scan-experiment] no scannable files under ${root}`);
    process.exit(0);
  }

  let totalFindings = 0;
  const report = [];
  for (const file of files) {
    const findings = scanFile(file);
    if (findings.length > 0) {
      totalFindings += findings.length;
      report.push({ file: path.relative(process.cwd(), file), findings });
    }
  }

  if (report.length === 0) {
    console.log(`[scan-experiment] clean. ${files.length} file(s) scanned, 0 risky patterns.`);
    process.exit(0);
  }

  console.log(`[scan-experiment] ${totalFindings} pattern(s) found across ${report.length} file(s).`);
  console.log('Each finding is a notice for the maintainer, not an auto-fail.');
  console.log('');
  for (const { file, findings } of report) {
    console.log(`── ${file}`);
    for (const f of findings) {
      console.log(`   • ${f.label}  (${f.count}x)`);
      console.log(`     why:    ${f.why}`);
      console.log(`     sample: ${f.sample}`);
    }
    console.log('');
  }
  console.log('Allowed external script hosts (CSP):', ALLOWED_EXTERNAL_SCRIPT_HOSTS.join(', '));
  console.log('');
  console.log('Reviewer: confirm each finding is intentional and safe before merging.');

  // Exit 0 so the workflow stays a notice rather than a blocker. Convert to
  // exit 1 if we ever want a hard fail on certain rules.
  process.exit(0);
}

main();
