"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import useWorkspaceStore from "@/store/useWorkspaceStore"
import type { Database } from "../../../types_db"

export type Workspace = Database['public']['Tables']['workspaces']['Row'];

const frameworks = [
  {
    value: "next.js",
    label: "Next.js",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
  },
]

export default function WorkspaceSelector() {
  const [open, setOpen] = React.useState(false)
  const { currentWorkspace, setCurrentWorkspace, workspaces, createAndSetWorkspace } = useWorkspaceStore()

  async function createNewWorkspace() {
    createAndSetWorkspace();
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {currentWorkspace
            ? `Workspace ${workspaces.findIndex((workspace) => workspace.id === currentWorkspace?.id) + 1}`
            : "Select workspace..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search framework..." />
          <CommandEmpty>No framework found.</CommandEmpty>
          <CommandGroup>
            {workspaces.map((workspace, i) => (
              <CommandItem
                key={workspace.id}
                onSelect={() => {
                  setCurrentWorkspace(workspace)
                  // setValue(currentValue === value ? "" : currentValue)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    currentWorkspace?.id === workspace.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {`Workspace ${i + 1}`}
                {/* {workspace.id} */}
              </CommandItem>
            ))}
            {/* Add new workspace */}

            <CommandItem
              onSelect={() => {
                createNewWorkspace()
                // setValue(currentValue === value ? "" : currentValue)
                setOpen(false)
              }}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  currentWorkspace?.id === undefined ? "opacity-100" : "opacity-0"
                )}
              />
              New workspace
            </CommandItem>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
