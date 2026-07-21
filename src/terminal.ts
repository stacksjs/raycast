import { chmod, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { environment, open } from '@raycast/api'
import { buildTerminalScript } from './buddy'

export async function runBuddyInTerminal(
  projectDirectory: string,
  commandName: string,
  terminalApplication: string,
  extraArguments: string[] = [],
): Promise<void> {
  const scriptsDirectory = path.join(environment.supportPath, 'commands')
  await mkdir(scriptsDirectory, { recursive: true })

  const scriptPath = path.join(scriptsDirectory, `${safeFileName(commandName)}.command`)
  const script = buildTerminalScript(projectDirectory, commandName, extraArguments)

  await writeFile(scriptPath, script, 'utf8')
  await chmod(scriptPath, 0o700)
  await open(scriptPath, terminalApplication.trim() || 'Terminal')
}

function safeFileName(commandName: string): string {
  return commandName.replaceAll(/[^\w-]/g, '-')
}
