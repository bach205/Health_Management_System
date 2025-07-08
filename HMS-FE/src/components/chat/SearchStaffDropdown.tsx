import React, { useState, useRef } from 'react';
import { searchStaff } from '../../services/user.service';
import { findOrCreateDirectConversation } from '../../services/conversation.service';
import { useAuthStore } from '../../store/authStore';
import type { IUser } from '../../types/chat.type';

interface Props {
    onSelectConversation: (conversation: any) => void;
}

const SearchStaffDropdown: React.FC<Props> = ({ onSelectConversation }) => {
    const { user } = useAuthStore();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<IUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const timeoutRef = useRef<any>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (value.trim().length === 0) {
            setResults([]);
            setShowDropdown(false);
            return;
        }
        setLoading(true);
        timeoutRef.current = setTimeout(async () => {
            try {
                const users = await searchStaff(value);
                setResults(users.filter((u: IUser) => String(u.id) !== user?.id));
                setShowDropdown(true);
            } catch {
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);
    };

    const handleSelect = async (staff: IUser) => {
        setShowDropdown(false);
        setQuery('');
        setResults([]);
        console.log(staff)
        if (!user) return;
        // Kiểm tra/tạo conversation 1-1
        const conversation = await findOrCreateDirectConversation(Number(user.id), staff.id);
        console.log(conversation)
        onSelectConversation(conversation);
    };

    return (
        <div className="relative w-full mb-2">
            <svg
                className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
            </svg>
            <input
                type="text"
                className="w-full px-3 py-2 border rounded"
                placeholder="Tìm kiếm (tên hoặc email)..."
                value={query}
                onChange={handleChange}
                onFocus={() => query && setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            />

            {showDropdown && results.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border rounded shadow max-h-60 overflow-y-auto">
                    {results.map((staff) => {
                        return (
                            <li
                                key={staff.id}
                                className="flex items-center px-3 py-2 cursor-pointer hover:bg-blue-100"
                                onMouseDown={() => { handleSelect(staff) }}
                            >
                                <img src={staff.avatar || '/images/avatar-default.png'} alt={staff.full_name} className="w-8 h-8 rounded-full mr-2" />
                                <div>
                                    <div className="font-medium">{staff.full_name}</div>
                                    <div className="text-xs text-gray-500">{staff.email}{'role' in staff ? ` (${(staff as any).role})` : ''}</div>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>
    );
};

export default SearchStaffDropdown; 