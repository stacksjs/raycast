export interface BuddyCommandArgument {
  name: string
  required: boolean
  variadic: boolean
}

export interface BuddyCommandOption {
  name: string
  flags: string[]
  description: string
  required: boolean
  boolean: boolean
  negated: boolean
  default?: unknown
}

export interface BuddyCommand {
  name: string
  description: string
  aliases: string[]
  namespace?: string
  usage: string
  arguments: BuddyCommandArgument[]
  options: BuddyCommandOption[]
  examples: string[]
}

export interface BuddyCommandInventory {
  commands: BuddyCommand[]
  total: number
}

export interface Preferences {
  projectDirectory: string
  terminalApplication: string
}
