"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  FilterFn,
  FilterFns,
  sortingFns,
  SortingFn,
} from "@tanstack/react-table"
import { rankItem, compareItems } from '@tanstack/match-sorter-utils'
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import ContactPopover from "@/components/contactPopover"
import { SetupPopover } from "@/components/setupPopover"
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs"
import { useUser } from "@/lib/useUser"
import { useToast } from "@/components/ui/use-toast"
import { v4 as uuidv4 } from 'uuid';
import WorkspaceSelector from "@/components/workspaceSelector"
import Navbar from "@/components/navbar"
import type { Database } from "../../../types_db"
import useWorkspaceStore from "@/store/useWorkspaceStore"
import useContactPopoverStore from "@/store/useContactPopoverStore"

type Contact = Database['public']['Tables']['contacts']['Row'];
type Workspace = Database['public']['Tables']['workspaces']['Row'];

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta(itemRank)

  // Return if the item should be filtered in/out
  return itemRank.passed
}

const fuzzySort: SortingFn<any> = (rowA, rowB, columnId) => {
  let dir = 0

  // Only sort by rank if the column has ranking information
  if (rowA.columnFiltersMeta[columnId]) {
    dir = compareItems(
      // @ts-ignore
      rowA.columnFiltersMeta[columnId]!,
      rowB.columnFiltersMeta[columnId]!
    )
  }

  // Provide an alphanumeric fallback for when the item ranks are equal
  return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir
}

const columns: ColumnDef<Contact>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  // {
  //   accessorKey: "email",
  //   header: ({ column }) => {
  //     return (
  //       <Button
  //         variant="ghost"
  //         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
  //       >
  //         Email
  //         <ArrowUpDown className="ml-2 h-4 w-4" />
  //       </Button>
  //     )
  //   },
  //   cell: ({ row }) => <div className="lowercase">
  //     <Dialog>
  //       <DialogTrigger>
  //         {row.getValue("email")}
  //       </DialogTrigger>
  //       <ContactPopover contact={row.original} />
  //     </Dialog>
  //   </div>,
  // },
  // {
  //   accessorKey: "name",
  //   header: "Name",
  //   cell: ({ row }) => row.getValue("name"),

  // },
  // {
  //   accessorKey: "created_at",
  //   header: "Created at",
  //   cell: ({ row }) => row.getValue("created_at"),

  // }, {
  //   accessorKey: "data",
  //   header: "Data",
  //   cell: ({ row }) => row.getValue("data"),
  // },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const payment = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

function getColumns(columns: any) {
  let contactColumns = columns.map((column: string) => ({
    accessorKey: column,
    header: column,
    cell: ({ row }: {
      row: any
    }) => {
      // if (column.toLowerCase().includes('email')) {
      //   return (
      //     <div className="lowercase">
      //       <Dialog>
      //         <DialogTrigger>
      //           {row.getValue(column)}
      //         </DialogTrigger>
      //         <ContactPopover contact={row.original} />
      //       </Dialog>
      //     </div>
      //   )
      // }
      // return row.getValue(column)
      return (
        <div>
          {/* <Dialog> */}
          {/* <DialogTrigger> */}
          {row.getValue(column)}
          {/* </DialogTrigger> */}
          {/* <ContactPopover contact={row.original} /> */}
          {/* </Dialog> */}
        </div>
      )
    },
    ...(column.toLowerCase().includes('email') ? {
      filterFn: 'fuzzy',
      sortingFn: fuzzySort,
    } : {})
  }))
  contactColumns.push({
    id: "select",
    header: ({ table }: { table: any }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }: { row: any }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  })
  return contactColumns
}

export default function DataTable() {
  const { user, userDetails } = useUser()
  const contactPopover = useContactPopoverStore((state) => state)
  const { toast } = useToast()
  const supabase = createPagesBrowserClient();
  const { currentWorkspace, workspaces, setCurrentWorkspace, setWorkspaces, fetchWorkspaces } = useWorkspaceStore((state) => state)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [tableData, setTableData] = React.useState<any[]>([])
  const fileRef = React.useRef<HTMLInputElement>(null)
  const columns = getColumns(currentWorkspace?.columns ? currentWorkspace.columns : [])

  async function getMyWorkspaces() {
    // const res = await fetch('/api/get-my-workspaces');
    // const data = await res.json()
    // setWorkspaces(data);
    // if (data.length > 0) {
    //   setCurrentWorkspace(data[0])
    // }
    // get and set initial workspace
    fetchWorkspaces((workspaces) => {
      if (workspaces.length > 0) {
        setCurrentWorkspace(workspaces[0])
      }
    })
  }

  useEffect(() => {
    getMyWorkspaces()
  }, [])

  useEffect(() => {
    if (!currentWorkspace) return
    setTableData(JSON.parse(JSON.stringify(currentWorkspace?.contacts || "[]")))
  }, [currentWorkspace, currentWorkspace?.contacts?.length])

  const table = useReactTable({
    data: tableData,
    columns: columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    globalFilterFn: fuzzyFilter,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  })

  async function importContacts(e: React.ChangeEvent<HTMLInputElement>) {
    const fileId = uuidv4()
    const file = e.target.files?.[0]
    if (!file) return
    toast({
      title: 'Importing contacts',
      description: 'Please wait...',
      duration: 10000,
    })

    const { data, error } = await supabase.storage.from('contacts').upload(fileId, file)
    await fetch('/api/import-workspace-data', {
      method: 'POST',
      body: JSON.stringify({ fileId, workspaceId: currentWorkspace?.id })
    })
    toast({
      title: 'Contacts imported',
      duration: 10000,
    })
    fetchWorkspaces()
    // setContacts(contacts)
  }

  return (
    <><Navbar />
      {currentWorkspace &&
        <div className="w-full p-4">
          <div className="flex items-center py-4">
            {/* <Input
          placeholder="Filter emails..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        /> */}
            <WorkspaceSelector />
            <SetupPopover />
            {/* <Button className="ml-3"
          onClick={() => fileRef.current?.click()}
        >
          Setup
        </Button> */}
            <Button className="ml-3"
              variant="outline"
              onClick={() => fileRef.current?.click()}
            >
              {/* <Plus className="h-4 w-4" /> */}
              Import contacts
            </Button>
            <input
              type="file"
              ref={fileRef}
              className="hidden"
              onChange={importContacts}
              accept=".csv"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Input
            placeholder="Filter emails..."
            value={globalFilter}
            onChange={(event) =>
              setGlobalFilter(event.target.value)
            }
            className="max-w-sm mb-4"
          />
          {/* <Dialog open={contactPopover.open} onOpenChange={contactPopover.setOpen}>
        <ContactPopover contact={contactPopover.contact} />
      </Dialog> */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <>
                      <TableRow
                        key={row.id}
                        onClick={() => {
                          contactPopover.setContactId(row.id)
                          contactPopover.setContact(row.original)
                          contactPopover.setOpen(!contactPopover.open)
                        }}
                        className="cursor-pointer"
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}
                            className="truncate
                      max-w-xs
                      sm:max-w-sm
                      md:max-w-md
                      lg:max-w-lg
                      xl:max-w-xl
                      2xl:max-w-2xl
                      "
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                      {contactPopover.contactId == row.id && (
                        <Dialog open={contactPopover.open} onOpenChange={contactPopover.setOpen}>
                          <ContactPopover contact={contactPopover.contact} />
                        </Dialog>
                      )}
                    </>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </div>}
    </>
  )

}
