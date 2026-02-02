import React from 'react';

export const DebugPage = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const userRole = localStorage.getItem('userRole');
    const isAuthenticated = localStorage.getItem('isAuthenticated');

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">LocalStorage Debug</h1>

            <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border">
                    <h2 className="font-bold mb-2">currentUser:</h2>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                        {JSON.stringify(currentUser, null, 2)}
                    </pre>
                </div>

                <div className="bg-white p-4 rounded-lg border">
                    <h2 className="font-bold mb-2">userRole:</h2>
                    <pre className="bg-gray-100 p-3 rounded text-sm">
                        {userRole}
                    </pre>
                </div>

                <div className="bg-white p-4 rounded-lg border">
                    <h2 className="font-bold mb-2">isAuthenticated:</h2>
                    <pre className="bg-gray-100 p-3 rounded text-sm">
                        {isAuthenticated}
                    </pre>
                </div>

                <div className="bg-white p-4 rounded-lg border">
                    <h2 className="font-bold mb-2">Detected Role Logic:</h2>
                    <pre className="bg-gray-100 p-3 rounded text-sm">
                        currentUser?.role = {currentUser?.role}{'\n'}
                        Is caretaker? {currentUser?.role === 'caretaker' ? 'YES' : 'NO'}{'\n'}
                        Is warden? {currentUser?.role === 'warden' ? 'YES' : 'NO'}{'\n'}
                        Final role: {currentUser?.role === 'caretaker' || currentUser?.role === 'warden' ? 'admin' : 'student'}
                    </pre>
                </div>
            </div>
        </div>
    );
};
