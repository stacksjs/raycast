import { List } from '@raycast/api'
import React from 'react'

interface VersionSelectProps {
  versions?: string[]
  setVersion: (version?: string) => void
}

export function VersionSelect({ versions, setVersion }: VersionSelectProps): React.JSX.Element {
  return (
    <List.Dropdown tooltip="Select Version" storeValue={true} onChange={setVersion}>
      {versions?.map(version => (
        <List.Dropdown.Item key={version} value={version} title={version} />
      ))}
    </List.Dropdown>
  )
}
