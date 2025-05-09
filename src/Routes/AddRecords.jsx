import Sidebar from "../Components/Sidebar";
import { useState } from "react";
import Swal from "sweetalert2";
import RecordModal from "./../Modal/RecordModal";

function AddRecords({ onRecordAdded }) {
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        no: "",
        document_type: "Select type",
        date_approved: "",
        title: "",
    });

    const documentTypes = ["Select type", "Ordinance", "Resolution", "Motion"];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.no || formData.document_type === "Select type" || !formData.date_approved || !formData.title) {
            Swal.fire({
                title: "Error",
                text: "Please fill in all required fields.",
                icon: "error",
                confirmButtonColor: "#FF6767",
            });
            return;
        }

        console.log("Form Submitted:", formData);
        setShowModal(true);
    };

    const handleConfirm = async () => {
        try {
            console.log("Submitting data:", formData);

            const response = await fetch("http://127.0.0.1:8000/api/add-record", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (!response.ok) {
                if (response.status === 422 && result.errors?.no) {
                    throw new Error(`A ${formData.document_type} with number ${formData.no} already exists.`);
                }
                throw new Error(result.message || "Failed to add record.");
            }

            Swal.fire({
                title: "Success!",
                text: "New record added successfully",
                icon: "success",
                confirmButtonColor: "#408286",
            });

            // Send new record to Dashboard
            if (onRecordAdded) {
                onRecordAdded({
                    no: formData.no,
                    document_type: formData.document_type,
                    date_approved: formData.date_approved,
                    title: formData.title,
                    status: "No Status Yet",
                    remarks: "No Remarks",
                });
            }

            setFormData({
                no: "",
                document_type: "Select type",
                date_approved: "",
                title: "",
            });

            setShowModal(false);
        } catch (error) {
            console.error("Error:", error);
            Swal.fire({
                title: "Error",
                text: error.message,
                icon: "error",
                confirmButtonColor: "#FF6767",
            });
        }
    };

    return (
        <div className="flex">
            <Sidebar />
            <div className="flex flex-col w-full h-screen overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="font-poppins font-bold uppercase text-[#494444] text-[35px]">
                        Add Record
                    </h1>
                </div>

                {/* Main content container */}
                <div className="w-full border rounded-lg shadow-lg p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* No., Document Type, and Date Approved */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">No.</label>
                                <input
                                    type="text"
                                    name="no"
                                    placeholder="Ex. 001-2025"
                                    value={formData.no}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#408286] focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Document Type</label>
                                <select
                                    name="document_type"
                                    value={formData.document_type}
                                    onChange={handleChange}
                                    className="cursor-pointer w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#408286] focus:border-transparent"
                                >
                                    {documentTypes.map((type, index) => (
                                        <option key={index} value={type} disabled={type === "Select type"}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Date Approved</label>
                                <input
                                    type="date"
                                    name="date_approved"
                                    value={formData.date_approved}
                                    onFocus={(e) => e.target.showPicker()}
                                    onChange={handleChange}
                                    className="cursor-pointer w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#408286] focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Title</label>
                            <textarea
                                name="title"
                                value={formData.title}
                                placeholder="Enter title here..."
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#408286] focus:border-transparent"
                                rows="10"
                            ></textarea>
                        </div>

                        {/* Submit Button */}
                        <div className="text-left flex gap-2">
                            <button
                                type="submit"
                                className="bg-[#408286] hover:bg-[#357a74] text-sm font-poppins text-white font-semibold py-2 px-4 rounded-md transition duration-300 shadow-md"
                            >
                                Add Record
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setFormData({
                                        no: "",
                                        document_type: "Select type",
                                        date_approved: "",
                                        title: "",
                                    })
                                }
                                className="bg-gray-600 hover:bg-gray-700 text-sm text-white font-poppins font-semibold py-2 px-4 rounded-md transition duration-300 shadow-md"
                            >
                                Clear
                            </button>
                        </div>
                    </form>
                </div>
                {showModal && (
                    <RecordModal formData={formData} onClose={() => setShowModal(false)} onConfirm={handleConfirm} />
                )}
            </div>
        </div>
    );
}

export default AddRecords;