import type { Register } from 'claude-code'
import { pairedFiles } from '../mods/paired-files.ts'
import { yamlCheck } from '../mods/yaml-check.ts'

// Single hooks entry point: the engine loads one module per plugin.
// Each mod lives in ../mods/<name>.ts, exports a function that takes `on`,
// and is imported and called here by name (the engine requires static calls).
export const register: Register = on => {
  yamlCheck(on)
  pairedFiles(on)
}
