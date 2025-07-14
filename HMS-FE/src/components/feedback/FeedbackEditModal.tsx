import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface FeedbackEditModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (id: number, data: { content: string; rating: number }) => void;
    feedbackId: number;
    defaultContent: string;
    defaultRating: number;
}

const FeedbackEditModal: React.FC<FeedbackEditModalProps> = ({ open, onClose, onSubmit, feedbackId, defaultContent, defaultRating }) => {
    const [content, setContent] = useState(defaultContent);
    const [rating, setRating] = useState(defaultRating);
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        setContent(defaultContent);
        setRating(defaultRating);
    }, [defaultContent, defaultRating, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await onSubmit(feedbackId, { content, rating });
        setLoading(false);
        onClose();
    };

    const formContent = (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block mb-1 font-medium">Nội dung</label>
                <textarea
                    className="w-full border rounded p-2"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    required
                    rows={3}
                />
            </div>
            <div>
                <label className="block mb-1 font-medium">Đánh giá</label>
                <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map(star => (
                        <span
                            key={star}
                            className={`cursor-pointer text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            onClick={() => setRating(star)}
                            data-testid={`star-${star}`}
                        >
                            ★
                        </span>
                    ))}
                </div>
            </div>
        </form>
    );

    const actionButtons = (
        <>
            <Button type="button" onClick={onClose} variant="secondary">Hủy</Button>
            <Button type="submit" onClick={handleSubmit} disabled={loading}>Lưu</Button>
        </>
    );

    return (
        <Modal open={open} onClose={onClose} title="Sửa feedback" content={formContent} action={actionButtons} />
    );
};

export default FeedbackEditModal; 