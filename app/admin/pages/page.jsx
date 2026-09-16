'use client';
import { useEffect, useState } from "react";
import PageHeader from "@/app/admin/_components/PageHeader.jsx";
import ActionButtons from "@/app/admin/_components/ActionButtons.jsx";
import EmptyTable from "@/app/admin/_components/EmptyTable.jsx";
import { adminApi } from "@/app/admin/_lib/api.js";
import {
  useTableData,
  TableToolbar,
  TablePagination,
} from "@/app/admin/_components/TablePagination.jsx";

export default function PageListPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    adminApi("/admin/pages")
      .then((d) => setRows(d.data || []))
      .catch(() => {});
  }, []);

  const table = useTableData(rows, { pageSize: 10 });

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
                  <td>{r.title}</td>
                  <td>/page/{r.slug}</td>
                  <td>
                    <span
                      className={`statusBadge ${Number(r.active) ? "active" : "inactive"}`}
                    >
                      {Number(r.active) ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <ActionButtons editTo={`/admin/pages/${r.id}/edit`} />
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
