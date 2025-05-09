import { motion, AnimatePresence } from "framer-motion";

function StatusHistoryModal({ isOpen, onClose, statusHistory }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl w-[500px] max-h-[80vh] overflow-y-auto"
        >
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4 font-poppins text-gray-800">Status History</h2>
            {statusHistory.length > 0 ? (
              <ul className="space-y-2">
                {statusHistory.map((entry, index) => (
                  <li key={index} className="flex justify-between items-center border-b py-2">
                    <span className="font-poppins text-sm text-gray-700">{entry.status}</span>
                    <span className="font-poppins text-sm text-gray-500">
                      {new Date(entry.status_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="font-poppins text-sm text-gray-500">No status history available.</p>
            )}
            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="bg-[#408286] hover:bg-[#5FA8AD] text-white font-poppins font-medium py-2 px-4 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default StatusHistoryModal;