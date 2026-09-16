'use client';
import { useEffect, useState } from "react";
import PageHeader from "@/app/admin/_components/PageHeader.jsx";
import ActionButtons from "@/app/admin/_components/ActionButtons.jsx";
import EmptyTable from "@/app/admin/_components/EmptyTable.jsx";
import { adminApi, money } from "@/app/admin/_lib/api.js";
import { useAdminToast } from "@/app/admin/_components/AdminToast.jsx";
import { useAdminAuth } from "@/app/admin/_components/AdminAuth.jsx";
import { can } from "@/app/admin/_lib/permissions.js";
import {
  useTableData,
  TableToolbar,
  TablePagination,
} from "@/app/admin/_components/TablePagination.jsx";

export default function OrderListPage() {
  const [rows, setRows] = useState([]);
  const toast = useAdminToast();
  const auth = useAdminAuth();

  useEffect(() => {
    adminApi("/admin/orders")
      .then((d) => setRows(d.data || []))
      .catch((e) => toast.show(e.message, "error"));
  }, []);

  const table = useTableData(rows, { pageSize: 10 });

  return (
    <>
      <PageHeader
        title="Orders"
        subtitle="Manage fulfillment, payment and tracking."
      />
      <div className="adminPanel tableCard">
        <TableToolbar
          search={table.search}
          setSearch={table.setSearch}
          placeholder="Search orders by order #, customer, phone or status..."
          pageSize={table.pageSize}
          setPageSize={table.setPageSize}
          total={table.total}
        />
        <div className="tableResponsive">
          <table className="adminTable">
            <thead>
              <tr>
                <th>Sr No</th>
                <th>Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {!table.paginatedRows.length && (
                <EmptyTable
                  colSpan={8}
                  text={
                    table.search
                      ? `No orders matching "${table.search}"`
                      : "No records found."
                  }
                />
              )}
              {table.paginatedRows.map((r, i) => (
                <tr key={r.id}>
                  <td>{table.startIndex + i}</td>
                  <td>
                    <strong>{r.order_number}</strong>
                  </td>
                  <td>
                    {r.name}
                    <small>{r.phone}</small>
                  </td>
                  <td>{money(r.total)}</td>
                  <td>{r.payment_method}</td>
                  <td>
                    <span className="statusBadge">{r.status}</span>
                  </td>
                  <td>{r.created_at || "—"}</td>
                  <td>
                    <ActionButtons
                      editTo={
                        can(auth, "orders", "edit")
                          ? `/admin/orders/${r.id}/edit`
                          : null
                      }
                      invoiceTo={`/admin/orders/${r.id}/invoice`}
                      canEdit={can(auth, "orders", "edit")}
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
