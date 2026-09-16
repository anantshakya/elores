'use client';
import { useEffect, useState } from "react";
import PageHeader from "@/app/admin/_components/PageHeader.jsx";
import ActionButtons from "@/app/admin/_components/ActionButtons.jsx";
import EmptyTable from "@/app/admin/_components/EmptyTable.jsx";
import { adminApi } from "@/app/admin/_lib/api.js";
import { confirmDelete } from "@/app/admin/_lib/swal.js";
import { useAdminToast } from "@/app/admin/_components/AdminToast.jsx";
import { useAdminAuth } from "@/app/admin/_components/AdminAuth.jsx";
import { can } from "@/app/admin/_lib/permissions.js";
import {
  useTableData,
  TableToolbar,
  TablePagination,
} from "@/app/admin/_components/TablePagination.jsx";

export default function CategoryListPage() {
  const [rows, setRows] = useState([]);
  const toast = useAdminToast();
  const auth = useAdminAuth();

  const load = () => {
    adminApi("/categories")
      .then((d) => setRows(d.data || []))
      .catch((e) => toast.show(e.message, "error"));
  };

  useEffect(() => {
    load();
  }, []);

  const table = useTableData(rows, { pageSize: 10 });

  async function remove(row) {
    if (!(await confirmDelete(`Delete ${row.name}?`))) return;
    try {
      const d = await adminApi(`/admin/categories/${row.id}`, {
        method: "DELETE",
      });
      toast.show(d.message || "Category deleted");
      load();
    } catch (e) {
      toast.show(e.message, "error");
    }
  }

  return (
    <>
      <PageHeader
        title="Categories"
        subtitle="Organize products into collections."
        addTo="/admin/categories/new"
        canAdd={can(auth, "categories", "add")}
      />
      <div className="adminPanel tableCard">
        <TableToolbar
          search={table.search}
          setSearch={table.setSearch}
          placeholder="Search categories by name or slug..."
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
                <th>Slug</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {!table.paginatedRows.length && (
                <EmptyTable
                  colSpan={5}
                  text={
                    table.search
                      ? `No categories matching "${table.search}"`
                      : "No records found."
                  }
                />
              )}
              {table.paginatedRows.map((r, i) => (
                <tr key={r.id}>
                  <td>{table.startIndex + i}</td>
                  <td>
                    <strong>{r.name}</strong>
                  </td>
                  <td>{r.slug}</td>
                  <td>
                    <span
                      className={`statusBadge ${Number(r.active) ? "active" : "inactive"}`}
                    >
                      {Number(r.active) ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <ActionButtons
                      editTo={`/admin/categories/${r.id}/edit`}
                      onDelete={() => remove(r)}
                      canEdit={can(auth, "categories", "edit")}
                      canDelete={can(auth, "categories", "delete")}
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
