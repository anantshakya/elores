'use client';
import { Edit3, Trash2, FileText, Eye } from "lucide-react";
import { Link } from "@/app/_lib/router-compat.jsx";

export default function ActionButtons({ editTo, viewTo, invoiceTo, onDelete, canEdit = true, canDelete = true }) {
  return (
    <div className="tableActions">
      {viewTo && (
        <Link className="iconAction view" to={viewTo} title="View">
          <Eye size={16} />
        </Link>
      )}
      {invoiceTo && (
        <Link className="iconAction invoice" to={invoiceTo} title="Invoice">
          <FileText size={16} />
        </Link>
      )}
      {editTo && canEdit && (
        <Link className="iconAction edit" to={editTo} title="Edit">
          <Edit3 size={16} />
        </Link>
      )}
      {onDelete && canDelete && (
        <button className="iconAction delete" type="button" onClick={onDelete} title="Delete">
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}
