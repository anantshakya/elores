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

export default function BannerListPage() {
  const [rows, setRows] = useState([]);
  const toast = useAdminToast();
  const auth = useAdminAuth();

  const load = () => {
    adminApi("/admin/banners")
      .then((d) => setRows(d.data || []))
      .catch((e) => toast.show(e.message, "error"));
  };

  useEffect(() => {
    load();
  }, []);

  const table = useTableData(rows, { pageSize: 10 });

  async function remove(r) {
    if (!(await confirmDelete(`Delete banner ${r.title}?`))) return;
    try {
      const d = await adminApi(`/admin/banners/${r.id}`, { method: "DELETE" });
      toast.show(d.message || "Banner deleted");
      load();
    } catch (e) {
      toast.show(e.message, "error");
    }
  }

  return (
    <>
      <PageHeader
        title="Carousel"
        subtitle="Manage homepage carousel slides."
        addTo="/admin/carousel/new"
        canAdd={can(auth, "carousel", "add")}
      />
      <div className="adminPanel tableCard">
        <TableToolbar
          search={table.search}
          setSearch={table.setSearch}
          placeholder="Search slides by title or button text..."
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
                <th>Title</th>
                <th>CTA</th>
                <th>Order</th>
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
                      ? `No slides matching "${table.search}"`
                      : "No records found."
                  }
                />
              )}
              {table.paginatedRows.map((r, i) => (
                <tr key={r.id}>
                  <td>{table.startIndex + i}</td>
                  <td>
                    {r.image ? (
                      <img className="tableThumb" src={r.image} alt="" />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>{r.title}</td>
                  <td>{r.button_text}</td>
                  <td>{r.sort_order}</td>
                  <td>
                    <span
                      className={`statusBadge ${Number(r.active) ? "active" : "inactive"}`}
                    >
                      {Number(r.active) ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <ActionButtons
                      editTo={`/admin/carousel/${r.id}/edit`}
                      onDelete={() => remove(r)}
                      canEdit={can(auth, "carousel", "edit")}
                      canDelete={can(auth, "carousel", "delete")}
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
