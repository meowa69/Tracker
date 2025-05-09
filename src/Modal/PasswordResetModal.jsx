import React from "react";

function PasswordResetModal({ isOpen, onClose, newPassword, setNewPassword, confirmPassword, setConfirmPassword, handlePasswordReset }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 p-6">
        <h2 className="text-2xl font-semibold text-[#408286] mb-4">Reset Password</h2>

        <form onSubmit={handlePasswordReset}>
          {/* New Password Input */}
          <div className="mb-4">
            <label htmlFor="newPassword" className="text-sm font-semibold text-gray-600">New Password</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#408286]"
              required
            />
          </div>

          {/* Confirm Password Input */}
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-600">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#408286]"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="text-sm text-gray-600 hover:text-gray-800">Cancel</button>
            <button type="submit" className="text-white bg-[#408286] hover:bg-[#356f6f] rounded-md px-4 py-2">Reset</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PasswordResetModal;
