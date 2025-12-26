'use client';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';


export default function NavBar() {
    const { isAuthenticated, user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        window.location.href = '/';
    };

    return(
        <div className="flex justify-end bg-gray-200 w-full h-18">
            { isAuthenticated ? (
                <div className="flex items-center">
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-700 font-bold">{user?.username}</span>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 h-11 text-white px-4 py-2 rounded-md mr-5"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => {window.location.href = '/auth';}}
                            className="bg-blue-500 hover:bg-blue-700 h-11 text-white px-4 py-2 rounded-md mr-5"
                        >
                            Sign In  /  Sign Up
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
};