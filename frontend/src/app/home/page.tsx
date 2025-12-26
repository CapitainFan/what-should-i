'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthFetch } from '@/hooks/useAuthFetch';
import ProtectedRoute from '@/components/ui/ProtectedRoute';

interface User {
  _id: string;
  username: string;
  email: string;
  profilePicture: string | null;
  createdAt: string;
}

interface UsersResponse {
  count: number;
  users: User[];
}

export default function HomePage() {
  const { user, logout, isLoading: AuthLoading } = useAuth();
  const authFetch = useAuthFetch();
  const [usersData, setUsersData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (AuthLoading || hasFetchedRef.current) return;

    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await authFetch('/api/users');

        console.log(response)

        if (response.ok) {
          const data: UsersResponse = await response.json();
          setUsersData(data);
        }
      } catch (error) {
        console.error('Failed to fetch users data:', error);
      } finally {
        setLoading(false);
        hasFetchedRef.current = true;
      }
    };
  
      fetchUserData();
  }, [authFetch, AuthLoading]);

  if (AuthLoading) {
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
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">User Information</h2>
                <div className="space-y-3">
                  <p><strong>Username:</strong> {user?.username}</p>
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>Account Created:</strong>{ user ? new Date(user?.createdAt).toLocaleDateString() : 'no data'}</p>
                  <p><strong>User ID:</strong> {user?._id}</p>
                </div>

            </div>

        <main className="max-w-7xl mx-auto px-4 py-6">
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-blue-600">
                {loading ? '...' : usersData?.count || 0}
              </p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold mb-2">Current User</h3>
              <p className="text-xl font-semibold text-gray-800 truncate">
                {loading ? '...' : user?.username || 'N/A'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-bold">Users List</h2>
              {usersData && (
                <p className="text-gray-600 text-sm mt-1">
                  Showing {usersData.users.length} of {usersData.count} users
                </p>
              )}
            </div>

            {loading ? (
              <div className="p-6">
                <div className="animate-pulse space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-10 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="p-6 text-center text-red-600">
                {error}
              </div>
            ) : usersData && usersData.users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Username
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        ID
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {usersData.users.map((userItem) => (
                      <tr 
                        key={userItem._id}
                        className={`hover:bg-gray-50 ${
                          user && userItem._id === user._id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                              <span className="font-medium text-gray-700">
                                {userItem.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {userItem.username}
                                {user && userItem._id === user._id && (
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    You
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {userItem.email}
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">
                          {(userItem.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {userItem._id.substring(0, 8)}...
                          </code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                No users found
              </div>
            )}
          </div>
        </main>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}