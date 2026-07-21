import type { BuddyCommand } from '../types'
import { List } from '@raycast/api'
import React from 'react'

export function DetailsView({ command }: { command: BuddyCommand }): React.JSX.Element {
  return <List.Item.Detail markdown={buildMarkdown(command)} />
}

export function buildMarkdown(command: BuddyCommand): string {
  const sections = [
    `# ${command.name}`,
    command.description || 'No description provided.',
    `## Usage\n\n\`\`\`sh\n${command.usage.replace(/^\$ /, '')}\n\`\`\``,
  ]

  if (command.aliases.length)
    sections.push(`## Aliases\n\n${command.aliases.map(alias => `- \`${alias}\``).join('\n')}`)

  if (command.arguments.length) {
    const argumentsTable = command.arguments
      .map(argument => `| \`${argument.name}\` | ${argument.required ? 'Required' : 'Optional'} | ${argument.variadic ? 'Yes' : 'No'} |`)
      .join('\n')
    sections.push(`## Arguments\n\n| Name | Value | Variadic |\n| --- | --- | --- |\n${argumentsTable}`)
  }

  if (command.options.length) {
    const options = command.options
      .map(option => `- \`${formatFlags(option.flags)}\` - ${option.description}${formatDefault(option.default)}`)
      .join('\n')
    sections.push(`## Options\n\n${options}`)
  }

  if (command.examples.length) {
    const examples = command.examples.map(example => `\`\`\`sh\n${example}\n\`\`\``).join('\n\n')
    sections.push(`## Examples\n\n${examples}`)
  }

  return sections.join('\n\n')
}

function formatFlags(flags: string[]): string {
  return flags.map(flag => `${flag.length === 1 ? '-' : '--'}${flag}`).join(', ')
}

function formatDefault(value: unknown): string {
  return value === undefined ? '' : ` Default: \`${String(value)}\`.`
}
