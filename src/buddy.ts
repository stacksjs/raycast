import type { BuddyCommand, BuddyCommandInventory } from './types'
import { execFile } from 'node:child_process'
import { access, constants, stat } from 'node:fs/promises'
import path from 'node:path'

const destructiveCommands = new Set([
  'clean',
  'cloud:cleanup',
  'cloud:remove',
  'domains:remove',
  'fresh',
  'mail:user:delete',
  'migrate:fresh',
  'undeploy',
])

export async function loadBuddyInventory(projectDirectory: string): Promise<BuddyCommand[]> {
  const project = path.resolve(projectDirectory)
  const projectStats = await stat(project).catch(() => undefined)

  if (!projectStats?.isDirectory())
    throw new Error(`Stacks project directory not found: ${project}`)

  const buddyPath = path.join(project, 'buddy')
  await access(buddyPath, constants.X_OK).catch(() => {
    throw new Error(`No executable Buddy launcher found at ${buddyPath}`)
  })

  const stdout = await executeFile(buddyPath, ['list', '--json', '--no-interaction'], project)
  return parseBuddyInventory(stdout).commands
}

export function parseBuddyInventory(stdout: string): BuddyCommandInventory {
  let inventory: unknown

  try {
    inventory = JSON.parse(stdout)
  }
  catch {
    throw new Error('Buddy returned an invalid JSON command inventory')
  }

  if (!isRecord(inventory) || !Array.isArray(inventory.commands))
    throw new Error('Buddy returned an invalid command inventory')

  const commands = inventory.commands.filter(isBuddyCommand)
  if (commands.length !== inventory.commands.length)
    throw new Error('Buddy returned malformed command metadata')

  return {
    commands,
    total: typeof inventory.total === 'number' ? inventory.total : commands.length,
  }
}

export function commandLine(command: BuddyCommand): string {
  return `./buddy ${command.name}`
}

export function isDestructiveCommand(name: string): boolean {
  return destructiveCommands.has(name)
}

export function shellQuote(value: string): string {
  return `'${value.replaceAll("'", "'\\''")}'`
}

export function buildTerminalScript(projectDirectory: string, commandName: string, extraArguments: string[] = []): string {
  const buddyPath = path.join(projectDirectory, 'buddy')
  const invocation = [buddyPath, commandName, ...extraArguments].map(shellQuote).join(' ')

  return `#!/bin/zsh
cd -- ${shellQuote(projectDirectory)}
${invocation}
status=$?
printf '\nBuddy exited with status %s. Press Return to close.\n' "$status"
read -r
exit "$status"
`
}

function executeFile(file: string, args: string[], cwd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(file, args, {
      cwd,
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
      timeout: 30_000,
    }, (error, stdout, stderr) => {
      if (error) {
        const detail = stderr.trim() || error.message
        reject(new Error(`Could not load Buddy commands: ${detail}`))
        return
      }

      resolve(stdout)
    })
  })
}

function isBuddyCommand(value: unknown): value is BuddyCommand {
  return isRecord(value)
    && typeof value.name === 'string'
    && typeof value.description === 'string'
    && typeof value.usage === 'string'
    && Array.isArray(value.aliases)
    && Array.isArray(value.arguments)
    && Array.isArray(value.options)
    && Array.isArray(value.examples)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
