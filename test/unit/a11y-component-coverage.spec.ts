/**
 * This test ensures every Vue component in src/components/ has an accessibility
 * test in test/browser/a11y.spec.ts. When this test fails, it means a new
 * component was added without a corresponding axe test.
 *
 * To fix:
 *   1. Add the component import + a describe block to test/browser/a11y.spec.ts
 *   2. Or, with justification, add the relative path to SKIPPED_COMPONENTS below
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { assert, describe, it } from 'vitest'

const SKIPPED_COMPONENTS: Record<string, string> = {}

function normalizePath(filePath: string): string {
  return filePath.replaceAll('\\', '/')
}

function getVueFiles(dir: string, baseDir: string = dir): string[] {
  const files: string[] = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...getVueFiles(fullPath, baseDir))
      continue
    }
    if (entry.isFile() && entry.name.endsWith('.vue')) {
      files.push(normalizePath(path.relative(baseDir, fullPath)))
    }
  }

  return files
}

function getTestedComponents(testFileContent: string): Set<string> {
  const tested = new Set<string>()
  const importRegex = /import\s+(?:type\s+)?\w+\s+from\s+['"]@\/components\/([^"']+\.vue)['"]/g

  let match: RegExpExecArray | null
  while ((match = importRegex.exec(testFileContent)) !== null) {
    tested.add(normalizePath(match[1]!))
  }

  return tested
}

describe('a11y component test coverage', () => {
  const componentsDir = fileURLToPath(new URL('../../src/components', import.meta.url))
  const testFilePath = fileURLToPath(new URL('../browser/a11y.spec.ts', import.meta.url))

  it('should have accessibility tests for all components (or be explicitly skipped)', () => {
    const allComponents = getVueFiles(componentsDir)
    const testFileContent = fs.readFileSync(testFilePath, 'utf-8')
    const testedComponents = getTestedComponents(testFileContent)

    const missingTests = allComponents.filter(
      (component) => !testedComponents.has(component) && !SKIPPED_COMPONENTS[component],
    )

    assert.strictEqual(missingTests.length, 0, buildMissingTestsMessage(missingTests))
  })

  it('should not have obsolete entries in SKIPPED_COMPONENTS', () => {
    const allComponents = new Set(getVueFiles(componentsDir))

    const obsoleteSkips = Object.keys(SKIPPED_COMPONENTS).filter(
      (component) => !allComponents.has(component),
    )

    assert.strictEqual(obsoleteSkips.length, 0, buildObsoleteSkipsMessage(obsoleteSkips))
  })

  it('should not skip components that are actually tested', () => {
    const testFileContent = fs.readFileSync(testFilePath, 'utf-8')
    const testedComponents = getTestedComponents(testFileContent)

    const unnecessarySkips = Object.keys(SKIPPED_COMPONENTS).filter((component) =>
      testedComponents.has(component),
    )

    assert.strictEqual(unnecessarySkips.length, 0, buildUnnecessarySkipsMessage(unnecessarySkips))
  })
})

function buildMissingTestsMessage(missingTests: string[]): string {
  if (missingTests.length === 0) return ''
  return (
    `Missing a11y tests for ${missingTests.length} component(s):\n` +
    missingTests.map((c) => `  - ${c}`).join('\n') +
    '\n\nTo fix: add a describe block in test/browser/a11y.spec.ts importing the component, ' +
    'or add it to SKIPPED_COMPONENTS in test/unit/a11y-component-coverage.spec.ts with a justification.'
  )
}

function buildObsoleteSkipsMessage(obsoleteSkips: string[]): string {
  if (obsoleteSkips.length === 0) return ''
  return (
    `Obsolete SKIPPED_COMPONENTS entries:\n` +
    obsoleteSkips.map((c) => `  - ${c}`).join('\n') +
    '\n\nThese components no longer exist. Remove them from SKIPPED_COMPONENTS.'
  )
}

function buildUnnecessarySkipsMessage(unnecessarySkips: string[]): string {
  if (unnecessarySkips.length === 0) return ''
  return (
    `Unnecessary SKIPPED_COMPONENTS entries:\n` +
    unnecessarySkips.map((c) => `  - ${c}`).join('\n') +
    '\n\nThese components are already tested. Remove them from SKIPPED_COMPONENTS.'
  )
}
