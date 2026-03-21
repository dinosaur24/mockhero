import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const tables = [
  {
    name: "customers",
    columns: ["id", "name", "email"],
    rows: [
      ["1", "Maximilian Bergmann", "max@web.de"],
      ["2", "Camille Dubois", "camille@orange.fr"],
      ["3", "Lucas Silva", "lucas@uol.com.br"],
    ],
  },
  {
    name: "orders",
    columns: ["id", "customer_id", "total", "status"],
    rows: [
      ["1", "1", "$129.99", "completed"],
      ["2", "1", "$49.50", "pending"],
      ["3", "3", "$299.00", "completed"],
    ],
  },
  {
    name: "order_items",
    columns: ["id", "order_id", "product_id", "qty"],
    rows: [
      ["1", "1", "2", "1"],
      ["2", "1", "4", "3"],
      ["3", "3", "1", "2"],
    ],
  },
  {
    name: "products",
    columns: ["id", "name", "price", "sku"],
    rows: [
      ["1", "Wireless Headphones", "$79.99", "WH-1000"],
      ["2", "USB-C Cable", "$12.99", "UC-200"],
      ["3", "Laptop Stand", "$49.99", "LS-300"],
      ["4", "Mouse Pad XL", "$24.99", "MP-400"],
    ],
  },
]

const fkColumns = new Set(["customer_id", "order_id", "product_id"])

export function RelationalDataShowcase() {
  return (
    <section className="px-4 md:px-6 py-16 lg:py-24 bg-muted/50">
      <div className="mx-auto max-w-screen-xl">
        <div className="max-w-2xl mb-12">
          <Badge variant="outline" className="mb-4">Relational Data</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Seed your entire database. One call.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Generate multiple related tables with proper foreign keys. Every reference points to a real record.
            Tables are created in dependency order via topological sort.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tables.map((table) => (
            <Card key={table.name}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-mono">{table.name}</CardTitle>
                  <span className="text-xs text-muted-foreground">{table.rows.length} rows</span>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {table.columns.map((col) => (
                        <TableHead
                          key={col}
                          className={`text-xs ${fkColumns.has(col) ? "text-primary" : ""}`}
                        >
                          {col}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {table.rows.map((row, rIdx) => (
                      <TableRow key={rIdx}>
                        {row.map((cell, cIdx) => (
                          <TableCell
                            key={cIdx}
                            className={`text-xs font-mono ${
                              fkColumns.has(table.columns[cIdx]) ? "text-primary font-semibold" : ""
                            }`}
                          >
                            {cell}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
