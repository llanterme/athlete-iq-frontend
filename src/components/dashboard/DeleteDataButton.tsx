"use client";

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

interface DeleteDataButtonProps {
  className?: string;
}

export function DeleteDataButton({ className = '' }: DeleteDataButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteClick = () => {
    setShowModal(true);
    setConfirmText('');
    setError(null);
  };

  const handleCloseModal = () => {
    if (!isDeleting) {
      setShowModal(false);
      setConfirmText('');
      setError(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!session?.user?.id || confirmText !== 'DELETE') {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await apiClient.deleteUserData(session.user.id);
      
      // Clear any local storage
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }

      // Sign out and redirect
      await signOut({ redirect: false });
      router.push('/login?deleted=true');
      
    } catch (err) {
      console.error('Error deleting user data:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete data');
      setIsDeleting(false);
    }
  };

  const isConfirmValid = confirmText === 'DELETE';

  return (
    <>
      {/* Delete Button */}
      <button
        onClick={handleDeleteClick}
        className={`flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${className}`}
        aria-label="Delete all account data"
      >
        <span className="text-lg">🗑️</span>
        <span>Delete All Data</span>
      </button>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-red-500/20 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Delete All Data</h3>
                <p className="text-red-400 text-sm">This action cannot be undone</p>
              </div>
            </div>

            {/* Warning Text */}
            <div className="mb-6">
              <p className="text-white/80 mb-4">
                This will permanently delete all your data from our systems:
              </p>
              <ul className="space-y-2 text-white/70 text-sm">
                <li className="flex items-center space-x-2">
                  <span className="text-red-400">•</span>
                  <span>All Strava activity data</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-red-400">•</span>
                  <span>TSS calculations and fitness metrics</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-red-400">•</span>
                  <span>Training thresholds and preferences</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-red-400">•</span>
                  <span>Chat history and conversations</span>
                </li>
              </ul>
            </div>

            {/* Confirmation Input */}
            <div className="mb-6">
              <label htmlFor="confirm-delete" className="block text-white/80 text-sm mb-2">
                Type <span className="font-bold text-red-400">DELETE</span> to confirm:
              </label>
              <input
                id="confirm-delete"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                disabled={isDeleting}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50"
                autoComplete="off"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleCloseModal}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={!isConfirmValid || isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Forever</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}