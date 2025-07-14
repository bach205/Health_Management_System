import React, { useState } from 'react';
import Button from '../ui/Button';

interface FeedbackDeleteButtonProps {
    feedbackId: number;
    onDelete: (id: number) => Promise<void>;
}

const FeedbackDeleteButton: React.FC<FeedbackDeleteButtonProps> = ({ feedbackId, onDelete }) => {
    const [confirm, setConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        await onDelete(feedbackId);
        setLoading(false);
        setConfirm(false);
    };

    if (confirm) {
        return (
            <div className="inline-flex items-center space-x-2">
                <span>Bạn chắc chắn?</span>
                <Button variant="danger" onClick={handleDelete} disabled={loading}>Xóa</Button>
                <Button variant="secondary" onClick={() => setConfirm(false)}>Hủy</Button>
            </div>
        );
    }

    return (
        <Button variant="danger" onClick={() => setConfirm(true)}>
            Xóa
        </Button>
    );
};

export default FeedbackDeleteButton; 