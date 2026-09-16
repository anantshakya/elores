'use client';
export default function EmptyTable({ colSpan, text = "No records found." }) {
  return (
    <tr>
      <td className="emptyTable" colSpan={colSpan}>{text}</td>
    </tr>
  );
}
