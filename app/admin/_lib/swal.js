import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export async function confirmDelete(title = "Delete this record?") {
  const result = await Swal.fire({
    title,
    text: "This action cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete",
    cancelButtonText: "Cancel",
    reverseButtons: true,
    focusCancel: true,
    customClass: {
      popup: "eloresSwal",
      confirmButton: "swalConfirm",
      cancelButton: "swalCancel",
    },
  });
  return result.isConfirmed;
}
