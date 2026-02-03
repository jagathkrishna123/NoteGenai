import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Info, AlertCircle, CheckCircle2 } from 'lucide-react';

const Notification = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const broadcasts = JSON.parse(localStorage.getItem('broadcasts') || '[]');

        if (currentUser) {
            // Filter broadcasts: either 'all' or specifically targeted to this user
            const filtered = broadcasts.filter(b =>
                b.type === 'all' || (b.targetUserIds && b.targetUserIds.includes(currentUser.id))
            );
            setNotifications(filtered);
        }
    }, []);

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Notifications</h1>
                    <p className="text-gray-600">Stay updated with the latest announcements and system alerts.</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                    <Bell className="w-6 h-6 text-blue-600" />
                </div>
            </div>

            <div className="space-y-4">
                {notifications.length > 0 ? (
                    notifications.map((note) => (
                        <div key={note.id} className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
                            <div className="flex items-start gap-4">
                                <div className={`p-2 rounded-lg ${note.subject.toLowerCase().includes('maintenance') ? 'bg-orange-100 text-orange-600' :
                                        note.subject.toLowerCase().includes('new') ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                                    }`}>
                                    {note.subject.toLowerCase().includes('maintenance') ? <AlertCircle className="w-5 h-5" /> :
                                        note.subject.toLowerCase().includes('new') ? <CheckCircle2 className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-bold text-gray-900 text-lg">{note.subject}</h3>
                                        <div className="flex items-center text-xs text-gray-400">
                                            <Calendar className="w-3.5 h-3.5 mr-1" />
                                            {note.sentAt}
                                        </div>
                                    </div>
                                    <p className="text-gray-600 leading-relaxed">{note.message}</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-xl shadow-sm p-16 text-center border border-dashed border-gray-300">
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Bell className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">All caught up!</h3>
                        <p className="text-gray-500 max-w-xs mx-auto">You don't have any new notifications at the moment. Check back later for updates.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notification;