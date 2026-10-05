import { AlertCircle } from "lucide-react";

const ConfirmModal = ({
  open,
  title = "Confirm",
  message = "Are you sure?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  danger = true,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] px-4">
      <div className="bg-white max-w-md w-full border-t-4 border-orange-500 shadow-2xl">
        <div className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0 ${danger ? "bg-red-600" : "bg-blue-950"}`}>
              <AlertCircle size={20} color="white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-blue-950">{title}</h3>
              <p className="text-sm text-gray-600 font-medium mt-1">{message}</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-blue-950/10">
            <button type="button" onClick={onCancel}
              className="px-5 py-2 text-xs font-bold uppercase tracking-wider border-2 border-blue-950/20 text-blue-950 hover:bg-gray-50 transition-colors">
              {cancelLabel}
            </button>
            <button type="button" onClick={onConfirm}
              className={`px-5 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors border-2 ${
                danger
                  ? "bg-red-600 border-red-600 hover:bg-red-700"
                  : "bg-blue-950 border-blue-950 hover:bg-blue-900"
              }`}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
