import { describe, expect, it } from 'bun:test'
import { buildTerminalScript, commandLine, isDestructiveCommand, parseBuddyInventory, shellQuote } from '../src/buddy'

const command = {
  name: 'make:model',
  description: 'Create a model',
  aliases: ['model'],
  namespace: 'make',
  usage: '$ buddy make:model [name]',
  arguments: [{ name: 'name', required: false, variadic: false }],
  options: [],
  examples: ['buddy make:model User'],
}

describe('Buddy command inventory', () => {
  it('parses the machine-readable Buddy contract', () => {
    const inventory = parseBuddyInventory(JSON.stringify({ commands: [command], total: 1 }))

    expect(inventory.total).toBe(1)
    expect(inventory.commands[0]?.name).toBe('make:model')
  })

  it('rejects output that is not an inventory', () => {
    expect(() => parseBuddyInventory('not json')).toThrow('invalid JSON')
    expect(() => parseBuddyInventory('{}')).toThrow('invalid command inventory')
  })

  it('builds copyable commands and safely quotes shell values', () => {
    expect(commandLine(command)).toBe('./buddy make:model')
    expect(shellQuote("Chris' Project")).toBe("'Chris'\\'' Project'")
  })

  it('identifies destructive commands without flagging ordinary actions', () => {
    expect(isDestructiveCommand('migrate:fresh')).toBeTrue()
    expect(isDestructiveCommand('make:model')).toBeFalse()
  })

  it('builds a terminal script without interpolating unquoted paths or arguments', () => {
    const script = buildTerminalScript("/tmp/Chris' Project", 'make:model', ['Customer Record'])

    expect(script).toContain("cd -- '/tmp/Chris'\\'' Project'")
    expect(script).toContain("'/tmp/Chris'\\'' Project/buddy' 'make:model' 'Customer Record'")
  })
})
