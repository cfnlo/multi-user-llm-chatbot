import React, { useState } from 'react';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  roomName: string;
}

const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose, roomId, roomName }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [invitationUrl, setInvitationUrl] = useState('');
  const [error, setError] = useState('');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/rooms/${roomId}/invite-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create invitation');
      }

      setInvitationUrl(data.invitationUrl);
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(invitationUrl);
      alert('Invitation link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Invite to {roomName}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {!invitationUrl ? (
          <form onSubmit={handleInvite}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email address"
                required
              />
            </div>

            {error && (
              <div className="mb-4 text-red-600 text-sm">{error}</div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Send Invitation'}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 text-sm mb-2">
                Invitation created successfully! Share this link with the person you want to invite:
              </p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={invitationUrl}
                  readOnly
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded bg-gray-50"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setInvitationUrl('');
                  onClose();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InviteModal; 