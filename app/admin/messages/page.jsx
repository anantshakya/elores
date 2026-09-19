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

export default function MessagePage() {
  const [rows, setRows] = useState([]);
  const toast = useAdminToast();

  const load = () => {
    adminApi("/admin/messages")
      .then((d) => setRows((d.data || []).filter((x) => x.is_deleted !== 'deleted')))
      .catch((e) => toast.show(e.message, "error"));
  };

  useEffect(() => {
    load();
  }, []);

  const table = useTableData(rows, { pageSize: 10 });

  async function remove(r) {
    if (!(await confirmDelete(`Delete message from ${r.name}? (Status will change to deleted)`))) return;
    try {
      const d = await adminApi(`/admin/messages/${r.id}`, { method: "DELETE" });
      toast.show(d.message || "Message marked as deleted");
      load();
    } catch (e) {
      toast.show(e.message, "error");
    }
  }

  return (
    <>
      <PageHeader
        title="Messages"
        subtitle="Customer enquiries from contact forms."
      />
      <div className="adminPanel tableCard">
        <TableToolbar
          search={table.search}
          setSearch={table.setSearch}
          placeholder="Search messages by name, email, subject or text..."
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
                <th>Subject</th>
                <th>Message</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {!table.paginatedRows.length && (
                <EmptyTable
                  colSpan={7}
                  text={
                    table.search
                      ? `No messages matching "${table.search}"`
                      : "No records found."
                  }
                />
              )}
              {table.paginatedRows.map((r, i) => (
                <tr key={r.id}>
                  <td>{table.startIndex + i}</td>
                  <td><strong>{r.name}</strong></td>
                  <td>{r.email}</td>
                  <td>{r.subject}</td>
                  <td className="wideCell">{r.message}</td>
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
