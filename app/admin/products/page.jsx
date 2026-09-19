'use client';
import { useEffect, useState } from "react";
import PageHeader from "@/app/admin/_components/PageHeader.jsx";
import ActionButtons from "@/app/admin/_components/ActionButtons.jsx";
import EmptyTable from "@/app/admin/_components/EmptyTable.jsx";
import { adminApi, money, getImageUrl } from "@/app/admin/_lib/api.js";
import { confirmDelete } from "@/app/admin/_lib/swal.js";
import { useAdminToast } from "@/app/admin/_components/AdminToast.jsx";
import { useAdminAuth } from "@/app/admin/_components/AdminAuth.jsx";
import { can } from "@/app/admin/_lib/permissions.js";
import {
  useTableData,
  TableToolbar,
  TablePagination,
} from "@/app/admin/_components/TablePagination.jsx";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const toast = useAdminToast();
  const auth = useAdminAuth();

  const load = () => {
    adminApi("/admin/products")
      .then((d) => setProducts((d.data || []).filter((x) => x.is_deleted !== 'deleted')))
      .catch((e) => toast.show(e.message, "error"));
  };

  useEffect(() => {
    load();
  }, []);

  const table = useTableData(products, { pageSize: 10 });

  async function remove(row) {
    if (!(await confirmDelete(`Delete product "${row.name}"? (Status will change to deleted)`))) return;
    try {
      const d = await adminApi(`/admin/products/${row.id}`, { method: "DELETE" });
      toast.show(d.message || "Product marked as deleted");
      load();
    } catch (e) {
      toast.show(e.message, "error");
    }
  }

  return (
    <>
      <PageHeader
        title="Products"
        subtitle="Manage product catalog, inventory, and gallery."
        addTo="/admin/products/new"
        canAdd={can(auth, "products", "add")}
      />
      <div className="adminPanel tableCard">
        <TableToolbar
          search={table.search}
          setSearch={table.setSearch}
          placeholder="Search products..."
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
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
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
                      ? `No products matching "${table.search}"`
                      : "No records found."
                  }
                />
              )}
              {table.paginatedRows.map((row, index) => (
                <tr key={row.id}>
                  <td>{table.startIndex + index}</td>
                  <td>
                    {row.image ? (
                      <img
                        className="tableThumb"
                        src={getImageUrl(row.image)}
                        alt={row.name}
                      />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <strong>{row.name}</strong>
                    <small>{row.sku || row.slug}</small>
                  </td>
                  <td>{row.category_name || "—"}</td>
                  <td>{money(row.sale_price || row.price)}</td>
                  <td>{row.stock}</td>
                  <td>
                    <span
                      className={`statusBadge ${Number(row.active) ? "active" : "inactive"}`}
                    >
                      {Number(row.active) ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <ActionButtons
                      editTo={`/admin/products/${row.id}/edit`}
                      onDelete={() => remove(row)}
                      canEdit={can(auth, "products", "edit")}
                      canDelete={can(auth, "products", "delete")}
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
