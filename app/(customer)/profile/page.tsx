"use client";

import { useState, useEffect } from "react";
import ImageUpload from "@/components/ui/ImageUpload";

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    name: "John Doe",
    email: "customer@bazarsip.com",
    avatar_url: "",
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    // TODO: wire up to /api/users/:id
    await new Promise((r) => setTimeout(r, 600));
    setMessage("Profile update coming soon!");
    setSaving(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

        <form
          onSubmit={handleUpdateProfile}
          className="bg-white rounded-xl shadow-sm border p-6 space-y-6"
        >
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {message}
            </div>
          )}

          {/* Avatar Upload */}
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              {formData.avatar_url ? (
                <img
                  src={formData.avatar_url}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow">
                  {formData.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1">
              <ImageUpload
                folder="bazarsip/users"
                label="Profile Photo"
                hint="JPG, PNG or WebP. Max 5MB."
                value={formData.avatar_url}
                onChange={(val) =>
                  setFormData({ ...formData, avatar_url: val as string })
                }
                multiple={false}
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Change Password */}
          <div className="pt-6 border-t">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Change Password
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={formData.current_password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      current_password: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={formData.new_password}
                  onChange={(e) =>
                    setFormData({ ...formData, new_password: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={formData.confirm_password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirm_password: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
