// check_source_files.mjs: fails if a file of a source tree is in git without an open licence.
//
//   node tools/check_source_files.mjs
//
// The repo is public. Each file under primary-sources/ or secondary-sources/ that git holds or
// that is staged (other than SOURCE.md and README.md, and never a file in a local/ folder) must:
// - be named in the SOURCE.md of its folder, and
// - have an open licence in that SOURCE.md: the "Stored in git" line starts with "yes" and names
//   an open licence (CC BY, CC BY-SA, CC0, public domain, Open Parliament Licence, Open Government
//   Licence), or the folder is one of the exceptions below, each with its reason.
//   If the line of the SOURCE.md that names the file gives its own licence ("...; licence: ..."),
//   as the "Files" lines of the reading of 2026-11 do, that licence must be open: a folder can hold
//   items with different licences.
// A file with a non-commercial (NC) or no-derivatives (ND) licence stays in local/.
import { execSync } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'
import { dirname, basename, join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const OPEN = /\b(CC[ -]?BY(?![ -]?N[CD])(?:[ -]?SA)?|CC0|public domain|Open Parliament Licen[cs]e|Open Government Licen[cs]e|OGL)\b/i
const NOT_OPEN = /\b(CC[ -]?BY[ -]?(?:SA[ -]?)?N[CD]|NoAI)\b/i
// Folders whose files are data made by the repo or facts of a catalogue, not copies of a work.
const EXCEPTIONS = {
  'primary-sources/grs-catalogue-kwc': 'CSV exports of the GRS search catalogue: titles, dates and reference numbers only',
  'primary-sources/hku-newspaper-clippings': 'an index that the repo made from the catalogue: titles and dates only',
}

const sh = (c) => execSync(c, { cwd: ROOT, encoding: 'utf8' })
const files = new Set(
  (sh('git ls-files -z primary-sources secondary-sources') + sh('git diff --cached --name-only -z --diff-filter=AMR -- primary-sources secondary-sources'))
    .split('\0').filter(Boolean))
const problems = []
let n = 0
for (const f of [...files].sort()) {
  const name = basename(f)
  if (name === 'SOURCE.md' || name === 'README.md') continue
  n++
  if (/(^|\/)local\//.test(f)) { problems.push(`${f}: a local/ file is in git`); continue }
  const top = f.split('/').slice(0, 2).join('/')
  const src = join(ROOT, top, 'SOURCE.md')
  if (!existsSync(src)) { problems.push(`${f}: no ${top}/SOURCE.md`); continue }
  const text = readFileSync(src, 'utf8')
  const stem = name.replace(/\.[^.]+$/, '').replace(/\.commons$/, '')
  if (!text.includes(name) && !(name.endsWith('.commons.json') && text.includes(stem))) problems.push(`${f}: ${top}/SOURCE.md does not name it`)
  if (EXCEPTIONS[top]) continue
  const stored = (text.match(/^- \*\*Stored in git:\*\*.*(?:\n {2}.*)*/m) || [''])[0]
  const licence = (text.match(/^- \*\*Licen[cs]e:\*\*.*(?:\n {2}.*)*/m) || [''])[0]
  if (!/^- \*\*Stored in git:\*\* yes/i.test(stored)) problems.push(`${f}: the "Stored in git" line of ${top}/SOURCE.md does not say yes`)
  const own = text.split('\n').find((l) => l.includes(name) && /; licence: /i.test(l))
  if (own) {
    const lic = own.slice(own.search(/; licence: /i))
    if (!OPEN.test(lic)) problems.push(`${f}: its line in ${top}/SOURCE.md names no open licence`)
    if (NOT_OPEN.test(lic)) problems.push(`${f}: its line in ${top}/SOURCE.md names an NC, ND or NoAI licence: keep the file in local/`)
    continue
  }
  if (!OPEN.test(stored + '\n' + licence) && !(/^\| File .*Licen[cs]e/m.test(text) && OPEN.test(text)))
    problems.push(`${f}: ${top}/SOURCE.md names no open licence`)
  if (NOT_OPEN.test(stored + '\n' + licence)) problems.push(`${f}: ${top}/SOURCE.md names an NC, ND or NoAI licence: keep the file in local/`)
}
if (problems.length) {
  console.log(problems.join('\n'))
  console.log(`source files: ${problems.length} problem(s) in ${n} files`)
  process.exit(1)
}
console.log(`source files: ${n} files in git, each with an open licence or an exception\nok`)
