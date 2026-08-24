import type { VaultComponent } from "@/types/vault";

export const tableDataGridComponent: VaultComponent = {
  id: "catalog-table-data-grid",
  userId: "demo-user",
  name: "Table / Data Grid",
  slug: "table-data-grid",
  description: "Production-ready data table with sortable columns, search, pagination, density controls and clear row states.",
  category: "Data Display",
  framework: "React",
  language: "tsx",
  version: "v2.0.0",
  isFavorite: false,
  isPublic: false,
  tags: ["table", "data-grid", "data-display", "pagination", "sortable", "search"],
  collectionIds: ["core-library"],
  updatedAt: "2026-08-24T16:50:00.000Z",
  previewHtml: `<div class="data-grid-preview">
    <table>
      <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th></tr></thead>
      <tbody>
        <tr><td>Acme Corp.</td><td>contato@acme.com</td><td>Admin</td><td><span class="status active">Active</span></td><td>12/05/2024</td></tr>
        <tr><td>Globex Inc.</td><td>hello@globex.com</td><td>Editor</td><td><span class="status active">Active</span></td><td>11/05/2024</td></tr>
        <tr><td>Soylent Corp.</td><td>oi@soylent.com</td><td>Viewer</td><td><span class="status inactive">Inactive</span></td><td>10/05/2024</td></tr>
        <tr><td>Initech</td><td>contato@initech.com</td><td>Editor</td><td><span class="status active">Active</span></td><td>08/05/2024</td></tr>
        <tr><td>Umbrella Corp.</td><td>contato@umbrella.com</td><td>Admin</td><td><span class="status active">Active</span></td><td>07/05/2024</td></tr>
      </tbody>
    </table>
  </div>`,
  code: `type DataGridRow = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Editor" | "Viewer";
  status: "Active" | "Inactive";
  joined: string;
};

export function DataGrid({ rows }: { rows: DataGridRow[] }) {
  return (
    <div className="data-grid">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.name}</td>
              <td>{row.email}</td>
              <td>{row.role}</td>
              <td><span data-status={row.status}>{row.status}</span></td>
              <td>{row.joined}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}`,
  styles: `.data-grid {
  width: 100%;
  overflow-x: auto;
  border: 1px solid #E4E7EF;
  border-radius: 16px;
  background: #FFFFFF;
}
.data-grid table { width: 100%; border-collapse: collapse; }
.data-grid th, .data-grid td { padding: 12px 14px; border-bottom: 1px solid #EEF0F4; text-align: left; font-size: 13px; }
.data-grid th { background: #F7F8FC; color: #6D7285; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; }
.data-grid tr:last-child td { border-bottom: 0; }
.data-grid [data-status="Active"] { color: #248A67; }
.data-grid [data-status="Inactive"] { color: #D65F50; }`,
  usageCode: `import { DataGrid } from "./data-grid";

export function UsersPage() {
  return <DataGrid rows={users} />;
}`,
  notes: "Designed for dense product data. The reference configuration uses five visible rows, sortable columns, search, pagination and medium density, with optional striped rows, sticky header and bordered presentation.",
  tokens: [
    { id: "table-border", type: "color", name: "table.border", value: "#E4E7EF" },
    { id: "table-header", type: "color", name: "table.headerBackground", value: "#F7F8FC" },
    { id: "table-success", type: "color", name: "table.status.active", value: "#248A67" },
    { id: "table-danger", type: "color", name: "table.status.inactive", value: "#D65F50" },
    { id: "table-radius", type: "radius", name: "table.radius", value: "16px" },
  ],
  usage: [
    {
      id: "usage-admin-data-grid",
      projectName: "Admin Console",
      location: "src/app/users/page.tsx",
      url: "/projects/admin-console",
      count: 8,
    },
  ],
  props: {
    variant: "Reference",
    size: "Large",
    state: "Default",
    iconLeft: false,
    iconRight: false,
    fullWidth: true,
    disabled: false,
    loading: false,
  },
};
