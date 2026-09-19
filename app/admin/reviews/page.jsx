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

export default function ReviewPage() {
  const [rows, setRows] = useState([]);
  const toast = useAdminToast();

  const load = () => {
    adminApi("/admin/reviews")
      .then((d) => setRows((d.data || []).filter((x) => x.is_deleted !== 'deleted')))
      .catch((e) => toast.show(e.message, "error"));
  };

  useEffect(() => {
    load();
  }, []);

  const table = useTableData(rows, { pageSize: 10 });

  async function change(id, status) {
    try {
      const d = await adminApi(`/admin/reviews/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      toast.show(d.message || "Review updated");
      load();
    } catch (e) {
      toast.show(e.message, "error");
    }
  }

  async function remove(r) {
    if (!(await confirmDelete(`Delete review by ${r.name}? (Status will change to deleted and hidden from frontend)`))) return;
    try {
      const d = await adminApi(`/admin/reviews/${r.id}`, { method: "DELETE" });
      toast.show(d.message || "Review marked as deleted");
      load();
    } catch (e) {
      toast.show(e.message, "error");
    }
  }

  return (
    <>
      <PageHeader
        title="Reviews"
        subtitle="Moderate customer product reviews."
      />
      <div className="adminPanel tableCard">
        <TableToolbar
          search={table.search}
          setSearch={table.setSearch}
          placeholder="Search reviews by product, customer, or content..."
          pageSize={table.pageSize}
          setPageSize={table.setPageSize}
          total={table.total}
        />
        <div className="tableResponsive">
          <table className="adminTable">
            <thead>
              <tr>
                <th>Sr No</th>
                <th>Product</th>
                <th>Customer</th>
                <th>Rating</th>
                <th>Review</th>
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
                      ? `No reviews matching "${table.search}"`
                      : "No records found."
                  }
                />
              )}
              {table.paginatedRows.map((r, i) => (
                <tr key={r.id}>
                  <td>{table.startIndex + i}</td>
                  <td><strong>{r.product_name}</strong></td>
                  <td>{r.name}</td>
                  <td>{r.rating}/5</td>
                  <td className="wideCell">{r.review}</td>
                  <td>
                    <select
                      value={r.status}
                      onChange={(e) => change(r.id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
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
