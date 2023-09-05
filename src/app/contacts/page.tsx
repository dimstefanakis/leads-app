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
} from "@tanstack/react-table"
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
import { v4 as uuidv4 } from 'uuid';
import type { Database } from "../../../types_db"

export type Contact = Database['public']['Tables']['contacts']['Row'];
export type Workspace = Database['public']['Tables']['workspaces']['Row'];

export const columns: ColumnDef<Contact>[] = [
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
      if (column.toLowerCase().includes('email')) {
        return (
          <div className="lowercase">
            <Dialog>
              <DialogTrigger>
                {row.getValue(column)}
              </DialogTrigger>
              <ContactPopover contact={row.original} />
            </Dialog>
          </div>
        )
      }
      return row.getValue(column)
    },
  }))
  contactColumns.push({
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
  })
  return contactColumns
}

export default function DataTableDemo() {
  const { user, userDetails } = useUser()
  const supabase = createPagesBrowserClient();
  const [workspace, setWorkspace] = useState<Workspace>()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [tableData, setTableData] = React.useState<any[]>([])
  const fileRef = React.useRef<HTMLInputElement>(null)

  async function getWorkspace() {
    const res = await fetch('/api/get-workspace');
    const data = await res.json()
    setWorkspace(data)
  }

  useEffect(() => {
    getWorkspace()
  }, [])

  useEffect(() => {
    if (!workspace) return
    setTableData(JSON.parse(JSON.stringify(workspace?.contacts || "[]")))
  }, [workspace])

  const table = useReactTable({
    data: tableData,
    columns: getColumns(workspace?.columns ? workspace.columns : []),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
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
    },
  })

  async function importContacts(e: React.ChangeEvent<HTMLInputElement>) {
    const fileId = uuidv4()
    const file = e.target.files?.[0]
    if (!file) return
    const { data, error } = await supabase.storage.from('contacts').upload(fileId, file)
    await fetch('/api/import-workspace-data', {
      method: 'POST',
      body: JSON.stringify({ fileId, workspaceId: workspace?.id })
    })
    // setContacts(contacts)
  }

  return (
    workspace &&
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
                <TableRow
                  key={row.id}
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
    </div>
  )
}
