import { useState, useEffect, useRef } from "react";

function RecordModal({ formData = {}, onClose, onConfirm }) {
    const [shouldShow, setShouldShow] = useState(true);
    const confirmButtonRef = useRef(null);

    // Handle keyboard events for Escape and Enter
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onClose();
            } else if (event.key === "Enter") {
                event.preventDefault(); // Prevent form submission if inside a form
                onConfirm();
            }
        };

        // Focus the Confirm button on mount
        confirmButtonRef.current?.focus();

        // Add event listener for keydown
        document.addEventListener("keydown", handleKeyDown);

        // Cleanup event listener on unmount
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose, onConfirm]);

    return (
        <div
            className="fixed inset-0 bg-gray-900 bg-opacity-70 flex justify-center items-center transition-opacity duration-300 z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-[900px] h-[600px] flex flex-col transform transition-all duration-300 scale-100">
                {/* Modal Header */}
                <div className="border-b-2 border-[#408286] px-6 pt-6 pb-4">
                    <h2
                        id="modal-title"
                        className="text-2xl font-semibold text-gray-900 font-poppins uppercase text-center"
                    >
                        New Record Summary
                    </h2>
                    <p className="text-sm text-gray-600 font-poppins text-center mt-2">
                        Please review the details below
                    </p>
                </div>

                {/* Modal Content */}
                <div className="flex-1 px-6 py-6 overflow-auto">
                    <table className="w-full table-fixed border-collapse">
                        <tbody>
                            <tr className="border-b border-gray-200 hover:bg-[#e6f0f0] transition-colors duration-200">
                                <th className="text-sm font-semibold text-gray-700 font-poppins uppercase tracking-wide text-left py-4 pr-4 w-1/3">
                                    Document No.
                                </th>
                                <td className="text-sm text-gray-900 font-poppins font-medium py-4">
                                    {formData.no || "N/A"}
                                </td>
                            </tr>
                            <tr className="border-b border-gray-200 hover:bg-[#e6f0f0] transition-colors duration-200 ">
                                <th className="text-sm font-semibold text-gray-700 font-poppins uppercase tracking-wide text-left py-4 pr-4">
                                    Document Type
                                </th>
                                <td className="text-sm text-gray-900 font-poppins font-medium py-4">
                                    {formData.document_type || "N/A"}
                                </td>
                            </tr>
                            <tr className="border-b border-gray-200 hover:bg-[#e6f0f0] transition-colors duration-200">
                                <th className="text-sm font-semibold text-gray-700 font-poppins uppercase tracking-wide text-left py-4 pr-4">
                                    Date Approved
                                </th>
                                <td className="text-sm text-gray-900 font-poppins font-medium py-4">
                                    {formData.date_approved || "N/A"}
                                </td>
                            </tr>
                            <tr className="hover:bg-[#e6f0f0] transition-colors duration-200 ">
                                <th className="text-sm font-semibold text-gray-700 font-poppins uppercase tracking-wide text-left py-4 pr-4 align-top">
                                    Title
                                </th>
                                <td className="text-sm text-gray-900 font-poppins font-medium py-4 text-justify">
                                    {formData.title || "N/A"}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Modal Footer */}
                <div className="border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="bg-gray-600 hover:bg-gray-700 text-white text-sm font-poppins font-medium py-2 px-5 rounded-md transition duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                        aria-label="Cancel and close modal"
                    >
                        Cancel
                    </button>
                    <button
                        ref={confirmButtonRef}
                        onClick={onConfirm}
                        className="bg-[#408286] hover:bg-[#357a74] text-white text-sm font-poppins font-medium py-2 px-5 rounded-md transition duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-[#408286]"
                        aria-label="Confirm submission"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}

export default RecordModal;