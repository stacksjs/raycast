import type { BuddyCommand, Preferences } from './types'
import { Action, ActionPanel, Alert, confirmAlert, getPreferenceValues, Icon, List, openCommandPreferences } from '@raycast/api'
import { showFailureToast, usePromise } from '@raycast/utils'
import React from 'react'
import { commandLine, isDestructiveCommand, loadBuddyInventory } from './buddy'
import { DetailsView } from './components/DetailsView'
import { runBuddyInTerminal } from './terminal'

export default function Buddy(): React.JSX.Element {
  const preferences = getPreferenceValues<Preferences>()
  const { data: commands = [], error, isLoading, revalidate } = usePromise(
    loadBuddyInventory,
    [preferences.projectDirectory],
  )

  return (
    <List
      isLoading={isLoading}
      isShowingDetail
      searchBarPlaceholder="Search Buddy commands"
    >
      {!isLoading && commands.length === 0 && (
        <List.EmptyView
          icon={Icon.Warning}
          title={error ? 'Could Not Load Buddy Commands' : 'No Buddy Commands Found'}
          description={error?.message ?? 'The selected project returned an empty command inventory.'}
          actions={(
            <ActionPanel>
              <Action title="Open Preferences" icon={Icon.Gear} onAction={openCommandPreferences} />
              <Action title="Retry" icon={Icon.RotateClockwise} onAction={revalidate} />
            </ActionPanel>
          )}
        />
      )}
      {commands.map(command => (
        <List.Item
          title={command.name}
          subtitle={command.description}
          keywords={[...command.aliases, command.description]}
          key={command.name}
          icon={{ source: 'stacks-logo.ico' }}
          detail={<DetailsView command={command} />}
          actions={<CommandActions command={command} preferences={preferences} revalidate={revalidate} />}
        />
      ))}
    </List>
  )
}

function CommandActions({
  command,
  preferences,
  revalidate,
}: {
  command: BuddyCommand
  preferences: Preferences
  revalidate: () => Promise<unknown>
}): React.JSX.Element {
  const launch = async (extraArguments: string[] = []): Promise<void> => {
    try {
      if (isDestructiveCommand(command.name)) {
        const confirmed = await confirmAlert({
          title: `Run ${command.name}?`,
          message: 'This Buddy command can remove or replace project resources. Buddy may ask for another confirmation in the terminal.',
          primaryAction: {
            title: 'Open in Terminal',
            style: Alert.ActionStyle.Destructive,
          },
        })
        if (!confirmed)
          return
      }

      await runBuddyInTerminal(
        preferences.projectDirectory,
        command.name,
        preferences.terminalApplication,
        extraArguments,
      )
    }
    catch (error) {
      await showFailureToast(error, { title: `Could not run ${command.name}` })
    }
  }

  return (
    <ActionPanel>
      <Action
        title="Run in Terminal"
        icon={Icon.Terminal}
        style={isDestructiveCommand(command.name) ? Action.Style.Destructive : Action.Style.Regular}
        onAction={() => launch()}
      />
      <Action title="Show Help in Terminal" icon={Icon.QuestionMark} onAction={() => launch(['--help'])} />
      <Action.CopyToClipboard title="Copy Buddy Command" content={commandLine(command)} />
      <Action.ShowInFinder title="Show Project in Finder" path={preferences.projectDirectory} />
      <Action title="Reload Commands" icon={Icon.RotateClockwise} onAction={revalidate} />
      <Action title="Open Preferences" icon={Icon.Gear} onAction={openCommandPreferences} />
    </ActionPanel>
  )
}
