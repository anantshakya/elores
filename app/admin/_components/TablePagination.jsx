'use client';
import React, { useMemo, useState, useEffect } from "react";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";

export function useTableData(rows = [], { pageSize: initialPageSize = 10, searchFields } = {}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => {
      if (searchFields && searchFields.length > 0) {
        return searchFields.some((field) => {
          const val = row[field];
          return val !== null && val !== undefined && String(val).toLowerCase().includes(q);
        });
      }
      return Object.values(row).some((val) => {
        if (typeof val === "object" && val !== null) return false;
        return val !== null && val !== undefined && String(val).toLowerCase().includes(q);
      });
    });
  }, [rows, search, searchFields]);

  useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

  const total = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  const startIndex = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, total);

  return {
    search,
    setSearch,
    page: currentPage,
    setPage,
    pageSize,
    setPageSize,
    total,
    totalPages,
    paginatedRows,
    startIndex,
    endIndex,
  };
}

export function TableToolbar({
  search,
  setSearch,
  placeholder = "Search...",
  total = 0,
  pageSize = 10,
  setPageSize,
  pageSizeOptions = [10, 25, 50, 100],
}) {
  return (
    <div className="tableToolbar">
      <div className="tableSearchBox">
        <Search className="searchIcon" size={16} />
        <input
          type="text"
          className="tableSearchInput"
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            type="button"
            className="tableSearchClear"
            onClick={() => setSearch("")}
            title="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </div>

      <div className="tableToolbarRight">
        {setPageSize && (
          <label className="pageSizeSelect">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span>per page</span>
          </label>
        )}
      </div>
    </div>
  );
}

function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }
  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
}

export function TablePagination({
  page,
  setPage,
  totalPages,
  total,
  startIndex,
  endIndex,
}) {
  if (total === 0) {
    return null;
  }

  const pages = getPageNumbers(page, totalPages);

  return (
    <div className="tablePagination">
      <div className="paginationInfo">
        Showing <strong>{startIndex}</strong> to <strong>{endIndex}</strong> of{" "}
        <strong>{total}</strong> records
      </div>

      <div className="paginationButtons">
        <button
          type="button"
          className="paginationBtn"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          title="Previous Page"
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((p, idx) =>
          p === "..." ? (
            <span key={`ellipsis-${idx}`} className="paginationEllipsis">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className={`paginationBtn ${p === page ? "active" : ""}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          className="paginationBtn"
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
          title="Next Page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
