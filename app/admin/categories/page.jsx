'use client';
import { useEffect, useState } from "react";
import PageHeader from "@/app/admin/_components/PageHeader.jsx";
import ActionButtons from "@/app/admin/_components/ActionButtons.jsx";
import EmptyTable from "@/app/admin/_components/EmptyTable.jsx";
import { adminApi, getImageUrl } from "@/app/admin/_lib/api.js";
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
    adminApi("/admin/categories")
      .then((d) => setRows((d.data || []).filter((x) => x.is_deleted !== 'deleted')))
      .catch(() => {
        adminApi("/categories")
          .then((d) => setRows((d.data || []).filter((x) => x.is_deleted !== 'deleted')))
          .catch((e) => toast.show(e.message, "error"));
      });
  };

  useEffect(() => {
    load();
  }, []);

  const table = useTableData(rows, { pageSize: 10 });

  async function remove(row) {
    if (!(await confirmDelete(`Delete ${row.name}? (Status will change to deleted)`))) return;
    try {
      const d = await adminApi(`/admin/categories/${row.id}`, {
        method: "DELETE",
      });
      toast.show(d.message || "Category marked as deleted");
      load();
    } catch (e) {
      toast.show(e.message, "error");
    }
  }

  return (
    <>
      <PageHeader
        title="Categories"
        subtitle="Manage store categories and navigation."
        addTo="/admin/categories/new"
        canAdd={can(auth, "categories", "add")}
      />
      <div className="adminPanel tableCard">
        <TableToolbar
          search={table.search}
          setSearch={table.setSearch}
          placeholder="Search categories..."
          pageSize={table.pageSize}
          setPageSize={table.setPageSize}
          total={table.total}
        />
        <div className="tableResponsive">
          <table className="adminTable">
            <thead>
              <tr>
                <th>Sr No</th>
                <th>Image</th>
                <th>Name</th>
                <th>Slug</th>
                <th>Products</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {!table.paginatedRows.length && (
                <EmptyTable
                  colSpan={7}
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
                    {r.image ? (
                      <img
                        src={getImageUrl(r.image)}
                        alt={r.name}
                        style={{
                          width: "42px",
                          height: "42px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: "1px solid var(--admin-border)",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "8px",
                          background: "#eee5db",
                          display: "grid",
                          placeItems: "center",
                          fontSize: "10px",
                          color: "#888",
                        }}
                      >
                        No img
                      </div>
                    )}
                  </td>
                  <td>
                    <strong>{r.name}</strong>
                  </td>
                  <td>{r.slug}</td>
                  <td>{r.product_count || 0} items</td>
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
