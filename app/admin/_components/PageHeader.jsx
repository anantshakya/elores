'use client';
import { ArrowLeft, Plus } from "lucide-react";
import { Link } from "@/app/_lib/router-compat.jsx";

export default function PageHeader({
  title,
  subtitle,
  backTo,
  backLabel = "Back to list",
  addTo,
  addLabel = "Add New",
  canAdd = true,
}) {
  return (
    <div className="adminPageHeader">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {(backTo || (addTo && canAdd)) && (
        <div className="adminPageHeaderActions">
          {addTo && canAdd && (
            <Link className="primaryAction" to={addTo}>
              <Plus size={17} /> {addLabel}
            </Link>
          )}
          {backTo && (
            <Link className="secondaryAction" to={backTo} style={{ marginLeft: "auto" }}>
              <ArrowLeft size={16} /> {backLabel}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
