'use client';
import { useEffect, useState } from "react";
import PageHeader from "@/app/admin/_components/PageHeader.jsx";
import ActionButtons from "@/app/admin/_components/ActionButtons.jsx";
import EmptyTable from "@/app/admin/_components/EmptyTable.jsx";
import { adminApi } from "@/app/admin/_lib/api.js";
import { confirmDelete } from "@/app/admin/_lib/swal.js";
import { useAdminToast } from "@/app/admin/_components/AdminToast.jsx";
import {
  useTableData,
  TableToolbar,
  TablePagination,
} from "@/app/admin/_components/TablePagination.jsx";

export default function AdminUserListPage() {
  const [rows, setRows] = useState([]);
  const toast = useAdminToast();

  const load = () => {
    adminApi("/admin/users")
      .then((d) => setRows((d.data || []).filter((x) => x.is_deleted !== 'deleted')))
      .catch((x) => toast.show(x.message, "error"));
  };

  useEffect(() => {
    load();
  }, []);

  const table = useTableData(rows, { pageSize: 10 });

  async function remove(r) {
    if (!(await confirmDelete(`Delete admin ${r.name}? (Status will change to deleted)`))) return;
    try {
      const d = await adminApi(`/admin/users/${r.id}`, { method: "DELETE" });
      toast.show(d.message || "Admin marked as deleted");
      load();
    } catch (x) {
      toast.show(x.message, "error");
    }
  }

  return (
    <>
      <PageHeader
        title="Admin Users"
        subtitle="Create users and control menu/action permissions."
        addTo="/admin/users/new"
      />
      <div className="adminPanel tableCard">
        <TableToolbar
          search={table.search}
          setSearch={table.setSearch}
          placeholder="Search admins by name, email or role..."
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
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {!table.paginatedRows.length && (
                <EmptyTable
                  colSpan={6}
                  text={
                    table.search
                      ? `No admins matching "${table.search}"`
                      : "No records found."
                  }
                />
              )}
              {table.paginatedRows.map((r, i) => (
                <tr key={r.id}>
                  <td>{table.startIndex + i}</td>
                  <td>{r.name}</td>
                  <td>{r.email}</td>
                  <td>{r.role}</td>
                  <td>
                    <span
                      className={`statusBadge ${Number(r.active) ? "active" : "inactive"}`}
                    >
                      {Number(r.active) ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <ActionButtons
                      editTo={`/admin/users/${r.id}/edit`}
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
