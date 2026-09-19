'use client';
import { useEffect, useState } from "react";
import PageHeader from "@/app/admin/_components/PageHeader.jsx";
import EmptyTable from "@/app/admin/_components/EmptyTable.jsx";
import ActionButtons from "@/app/admin/_components/ActionButtons.jsx";
import { adminApi } from "@/app/admin/_lib/api.js";
import { useAdminToast } from "@/app/admin/_components/AdminToast.jsx";
import { confirmDelete } from "@/app/admin/_lib/swal.js";
import {
  useTableData,
  TableToolbar,
  TablePagination,
} from "@/app/admin/_components/TablePagination.jsx";

export default function CustomerListPage() {
  const [rows, setRows] = useState([]);
  const toast = useAdminToast();

  const load = () => {
    adminApi("/admin/customers")
      .then((d) => setRows((d.data || []).filter((x) => x.is_deleted !== 'deleted')))
      .catch((e) => toast.show(e.message, "error"));
  };

  useEffect(() => {
    load();
  }, []);

  const table = useTableData(rows, { pageSize: 10 });

  async function remove(r) {
    if (!(await confirmDelete(`Delete customer ${r.name || r.email}? (Status will change to deleted)`))) return;
    try {
      const d = await adminApi(`/admin/customers/${r.id}`, { method: "DELETE" });
      toast.show(d.message || "Customer marked as deleted");
      load();
    } catch (e) {
      toast.show(e.message, "error");
    }
  }

  return (
    <>
      <PageHeader
        title="Customers"
        subtitle="Registered customer accounts."
      />
      <div className="adminPanel tableCard">
        <TableToolbar
          search={table.search}
          setSearch={table.setSearch}
          placeholder="Search customers by name, email or phone..."
          pageSize={table.pageSize}
          setPageSize={table.setPageSize}
          total={table.total}
        />
        <div className="tableResponsive">
          <table className="adminTable">
            <thead>
              <tr>
                <th>Sr No</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {!table.paginatedRows.length && (
                <EmptyTable
                  colSpan={7}
                  text={
                    table.search
                      ? `No customers matching "${table.search}"`
                      : "No records found."
                  }
                />
              )}
              {table.paginatedRows.map((r, i) => (
                <tr key={r.id}>
                  <td>{table.startIndex + i}</td>
                  <td><strong>{r.name}</strong></td>
                  <td>{r.email}</td>
                  <td>{r.phone || "—"}</td>
                  <td>
                    <span
                      className={`statusBadge ${Number(r.active) ? "active" : "inactive"}`}
                    >
                      {Number(r.active) ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>{r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"}</td>
                  <td>
                    <ActionButtons
                      onDelete={() => remove(r)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TablePagination
          page={table.page}
          setPage={table.setPage}
          totalPages={table.totalPages}
          total={table.total}
          startIndex={table.startIndex}
          endIndex={table.endIndex}
        />
      </div>
    </>
  );
}
