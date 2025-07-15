import React, { useState } from 'react';
import FeedbackCreateModal from './FeedbackCreateModal';
import FeedbackEditModal from './FeedbackEditModal';
import FeedbackDeleteButton from './FeedbackDeleteButton';

interface FeedbackActionButtonsProps {
    feedbackId?: number;
    content?: string;
    rating?: number;
    onCreate: (data: { content: string; rating: number }) => Promise<void>;
    onEdit: (id: number, data: { content: string; rating: number }) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
}

const FeedbackActionButtons: React.FC<FeedbackActionButtonsProps> = ({ feedbackId, content, rating, onCreate, onEdit, onDelete }) => {
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);

    return (
        <div className="flex space-x-2">
            <button className="text-blue-500 underline" onClick={() => setShowCreate(true)}>
                Thêm feedback
            </button>
            {feedbackId && (
                <>
                    <button className="text-yellow-500 underline" onClick={() => setShowEdit(true)}>
                        Sửa
                    </button>
                    <FeedbackDeleteButton feedbackId={feedbackId} onDelete={onDelete} />
                </>
            )}
            <FeedbackCreateModal open={showCreate} onClose={() => setShowCreate(false)} onSubmit={onCreate} />
            {feedbackId && (
                <FeedbackEditModal
                    open={showEdit}
                    onClose={() => setShowEdit(false)}
                    onSubmit={onEdit}
                    feedbackId={feedbackId}
                    defaultContent={content || ''}
                    defaultRating={rating || 5}
                />
            )}
        </div>
    );
};

export default FeedbackActionButtons; 