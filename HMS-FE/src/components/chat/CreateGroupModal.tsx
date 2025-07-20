import React, { useState } from 'react';
import { createConversation } from '../../services/conversation.service';
import SearchStaffDropdown from './SearchStaffDropdown';
import type { IUser } from '../../types/chat.type';

interface Props {
    onClose: () => void;
    onCreated: () => void;
}

const CreateGroupModal: React.FC<Props> = ({ onClose, onCreated }) => {
    const [name, setName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<IUser[]>([]);

    const handleAddUser = (user: IUser) => {
        if (!selectedUsers.some((u) => u.id === user.id)) {
            setSelectedUsers((prev) => [...prev, user]);
        }
    };

    const handleRemoveUser = (id: string) => {
        setSelectedUsers((prev) => prev.filter((u) => String(u.id) !== id));
    };

    const handleCreate = async () => {
        if (!name || selectedUsers.length < 2)
            return alert('Cần ít nhất 2 thành viên và tên nhóm');

        await createConversation({
            name,
            type: 'group',
            participantIds: selectedUsers.map((u) => u.id),
        });

        onCreated();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-[400px] max-h-[90vh] overflow-y-auto shadow-lg">
                <h2 className="text-lg font-bold mb-4">Tạo nhóm mới</h2>

                <input
                    type="text"
                    placeholder="Tên nhóm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border px-3 py-2 rounded mb-4"
                />

                <h4 className="font-medium mb-2">Tìm thành viên</h4>
                <SearchStaffDropdown
                    selectedUserIds={selectedUsers.map((u) => String(u.id))}
                    onUserSelect={handleAddUser}
                />

                {selectedUsers.length > 0 && (
                    <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                        {selectedUsers.map((u) => (
                            <div
                                key={u.id}
                                className="flex justify-between items-center px-2 py-1 bg-gray-100 rounded"
                            >
                                <span>{u.full_name}</span>
                                <button
                                    onClick={() => handleRemoveUser(String(u.id))}
                                    className="text-red-500 text-sm"
                                >
                                    Xóa
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-4 flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
                        Hủy
                    </button>
                    <button
                        onClick={handleCreate}
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                    >
                        Tạo nhóm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateGroupModal;
