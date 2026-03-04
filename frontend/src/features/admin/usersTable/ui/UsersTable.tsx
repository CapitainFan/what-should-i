import { User } from '@/entities/user/model/types';

interface UsersTableProps {
  users: User[];
  currentUserId?: string;
  loading: boolean;
}

export const UsersTable = ({ users, currentUserId, loading }: UsersTableProps) => {
  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return <div className="p-6 text-center text-gray-500">No users found</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.map((user) => (
            <tr
              key={user._id}
              className={`hover:bg-gray-50 ${currentUserId === user._id ? 'bg-blue-50' : ''}`}
            >
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                    <span className="font-medium text-gray-700">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {user.username}
                      {currentUserId === user._id && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          You
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-gray-700">{user.email || 'No email'}</td>
              <td className="px-6 py-4 text-gray-600 text-sm">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'No date'}
              </td>
              <td className="px-6 py-4">
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {user._id ? user._id.substring(0, 8) + '...' : 'No ID'}
                </code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};