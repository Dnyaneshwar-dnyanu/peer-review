import React from "react";

function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      
      {/* Modal Card */}
      <div className="w-[90%] max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-6 animate-fadeIn">
        
        <h2 className="text-xl font-semibold text-white mb-3">
          {title}
        </h2>

        <p className="text-white/70 mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex justify-end gap-4">
          
          <button
            onClick={onCancel}
            className="
              px-4 py-2 rounded-lg
              bg-white/10 text-white/80
              border border-white/20
              hover:bg-white/20
              transition
            "
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="
              px-4 py-2 rounded-lg
              bg-red-500/20 text-red-200
              border border-red-400/30
              hover:bg-red-500/30
              hover:scale-[1.03]
              transition-all duration-200
              font-semibold
            "
          >
            Confirm
          </button>

        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;