'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth, useAuthFetch } from '@/features/auth/index';
import ProtectedRoute from '@/shared/ui/ProtectedRoute';
import { UserStats, UsersTable, fetchUsers, UsersData } from '@/features/admin/usersTable/index';


export default function AdminDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const authFetch = useAuthFetch();
  const [usersData, setUsersData] = useState<UsersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (authLoading || hasFetchedRef.current) return;

    const loadUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchUsers(authFetch);
        setUsersData(data);
      } catch (err) {
        console.error('Failed to fetch users data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch users');
      } finally {
        setLoading(false);
        hasFetchedRef.current = true;
      }
    };

    loadUsers();
  }, [authFetch, authLoading]);

  const validUsers = usersData?.users?.filter((u) => u?.username) || [];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">User Information</h2>
              <div className="space-y-3">
                <p>
                  <strong>Username:</strong> {user?.username || 'No username'}
                </p>
                <p>
                  <strong>Email:</strong> {user?.email || 'No email'}
                </p>
                <p>
                  <strong>Account Created:</strong>{' '}
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'No data'}
                </p>
                <p>
                  <strong>User ID:</strong> {user?._id || 'No ID'}
                </p>
              </div>
            </div>

            <UserStats
              totalUsers={validUsers.length}
              currentUsername={user?.username || 'N/A'}
              loading={loading}
            />

            <div className="bg-white rounded shadow overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-bold">Users List</h2>
                {usersData && <p className="text-gray-600 text-sm mt-1">{validUsers.length} users</p>}
              </div>

              <UsersTable
                users={validUsers}
                currentUserId={user?._id}
                loading={loading}
              />
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}