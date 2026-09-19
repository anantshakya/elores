'use client';
import { useEffect, useState } from "react";
import PageHeader from "@/app/admin/_components/PageHeader.jsx";
import ActionButtons from "@/app/admin/_components/ActionButtons.jsx";
import EmptyTable from "@/app/admin/_components/EmptyTable.jsx";
import { adminApi } from "@/app/admin/_lib/api.js";
import { useAdminToast } from "@/app/admin/_components/AdminToast.jsx";
import { confirmDelete } from "@/app/admin/_lib/swal.js";
import {
  useTableData,
  TableToolbar,
  TablePagination,
} from "@/app/admin/_components/TablePagination.jsx";

export default function PageListPage() {
  const [rows, setRows] = useState([]);
  const toast = useAdminToast();

  const load = () => {
    adminApi("/admin/pages")
      .then((d) => setRows((d.data || []).filter((x) => x.is_deleted !== 'deleted')))
      .catch((e) => toast.show(e.message, "error"));
  };

  useEffect(() => {
    load();
  }, []);

  const table = useTableData(rows, { pageSize: 10 });

  async function remove(r) {
    if (!(await confirmDelete(`Delete page ${r.title}? (Status will change to deleted and hidden from frontend)`))) return;
    try {
      const d = await adminApi(`/admin/pages/${r.id}`, { method: "DELETE" });
      toast.show(d.message || "Page marked as deleted");
      load();
    } catch (e) {
      toast.show(e.message, "error");
    }
  }

  return (
    <>
      <PageHeader
        title="Pages"
        subtitle="Manage About, policies, FAQ and SEO content."
        addTo="/admin/pages/new"
      />
      <div className="adminPanel tableCard">
        <TableToolbar
          search={table.search}
          setSearch={table.setSearch}
          placeholder="Search pages by title or slug..."
          pageSize={table.pageSize}
          setPageSize={table.setPageSize}
          total={table.total}
        />
        <div className="tableResponsive">
          <table className="adminTable">
            <thead>
              <tr>
                <th>Sr No</th>
                <th>Title</th>
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
                      ? `No pages matching "${table.search}"`
                      : "No records found."
                  }
                />
              )}
              {table.paginatedRows.map((r, i) => (
                <tr key={r.id}>
                  <td>{table.startIndex + i}</td>
                  <td><strong>{r.title}</strong></td>
                  <td>/page/{r.slug}</td>
                  <td>
                    <span
                      className={`statusBadge ${Number(r.active) ? "active" : "inactive"}`}
                    >
                      {Number(r.active) ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <ActionButtons
                      editTo={`/admin/pages/${r.id}/edit`}
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
