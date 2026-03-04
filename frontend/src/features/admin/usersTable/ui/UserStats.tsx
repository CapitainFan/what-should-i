interface UserStatsProps {
  totalUsers: number;
  currentUsername: string;
  loading: boolean;
}

export const UserStats = ({ totalUsers, currentUsername, loading }: UserStatsProps) => {
  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-2">Total Users</h3>
        <p className="text-3xl font-bold text-blue-600">
          {loading ? '...' : totalUsers}
        </p>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-2">Current User</h3>
        <p className="text-xl font-semibold text-gray-800 truncate">
          {loading ? '...' : currentUsername}
        </p>
      </div>
    </div>
  );
};