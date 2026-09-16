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

export default function CouponListPage() {
  const [rows, setRows] = useState([]);
  const toast = useAdminToast();
  const auth = useAdminAuth();

  const load = () => {
    adminApi("/admin/coupons")
      .then((d) => setRows(d.data || []))
      .catch((e) => toast.show(e.message, "error"));
  };

  useEffect(() => {
    load();
  }, []);

  const table = useTableData(rows, { pageSize: 10 });

  async function remove(r) {
    if (!(await confirmDelete(`Delete coupon ${r.code}?`))) return;
    try {
      const d = await adminApi(`/admin/coupons/${r.id}`, { method: "DELETE" });
      toast.show(d.message || "Coupon deleted");
      load();
    } catch (e) {
      toast.show(e.message, "error");
    }
  }

  return (
    <>
      <PageHeader
        title="Coupons"
        subtitle="Manage promotional discounts."
        addTo="/admin/coupons/new"
        canAdd={can(auth, "coupons", "add")}
      />
      <div className="adminPanel tableCard">
        <TableToolbar
          search={table.search}
          setSearch={table.setSearch}
          placeholder="Search coupons by code or type..."
          pageSize={table.pageSize}
          setPageSize={table.setPageSize}
          total={table.total}
        />
        <div className="tableResponsive">
          <table className="adminTable">
            <thead>
              <tr>
                <th>Sr No</th>
                <th>Code</th>
                <th>Type</th>
                <th>Value</th>
                <th>Minimum Order</th>
                <th>Expiry</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {!table.paginatedRows.length && (
                <EmptyTable
                  colSpan={8}
                  text={
                    table.search
                      ? `No coupons matching "${table.search}"`
                      : "No records found."
                  }
                />
              )}
              {table.paginatedRows.map((r, i) => (
                <tr key={r.id}>
                  <td>{table.startIndex + i}</td>
                  <td>
                    <strong>{r.code}</strong>
                  </td>
                  <td>{r.type}</td>
                  <td>{r.value}</td>
                  <td>{r.min_order}</td>
                  <td>{r.expires_at || "—"}</td>
                  <td>
                    <span
                      className={`statusBadge ${Number(r.active) ? "active" : "inactive"}`}
                    >
                      {Number(r.active) ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <ActionButtons
                      editTo={`/admin/coupons/${r.id}/edit`}
                      onDelete={() => remove(r)}
                      canEdit={can(auth, "coupons", "edit")}
                      canDelete={can(auth, "coupons", "delete")}
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
