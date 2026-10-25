import type { Register } from 'claude-code'

// Single hooks entry point: the engine loads one module per plugin.
// Each mod lives in ../mods/<name>.ts, exports a Register-shaped function,
// and is imported and called here by name (the engine requires static calls):
//
//   import { exampleMod } from '../mods/example-mod.ts'
//   ...
//   exampleMod(on, options)
export const register: Register = (on, options) => {}
