import React, { useRef, useEffect } from 'react';

interface ResetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function ResetModal({ isOpen, onClose, onConfirm }: ResetModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="ftd-export-modal" onClick={handleBackdropClick}>
            <div className="ftd-export-container">
                <div className="ftd-export-header">
                    <div className="ftd-export-title-group">
                        <h2 className="ftd-export-title" style={{ color: 'var(--ftd-error, #ef4444)' }}>Reset Playground?</h2>
                    </div>
                    <button className="ftd-export-close" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6 6 18M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <div className="ftd-export-body">
                    <p style={{ margin: 0, color: 'var(--ftd-text-secondary)', lineHeight: 1.5, fontSize: '15px' }}>
                        This will reset all your current customization to the default values. This action cannot be undone.
                    </p>
                </div>

                <div className="ftd-export-footer">
                    <button
                        className="ftd-btn-secondary"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="ftd-btn-primary"
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        Reset to Defaults
                    </button>
                </div>
            </div>
        </div>
    );
}
