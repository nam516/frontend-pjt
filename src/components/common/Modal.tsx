import { useEffect, type ReactNode } from "react";

type Props = {
    title: string;
    description?: string;
    width?: number;
    onClose: () => void;
    children: ReactNode;
    footer?: ReactNode;
};

/** 공통 모달. 배경 클릭·ESC 로 닫히고, 열려 있는 동안 배경 스크롤을 막는다. */
export default function Modal({ title, description, width, onClose, children, footer }: Props) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKey);

        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [onClose]);

    return (
        <div className="modal-backdrop" onMouseDown={onClose}>
            <div
                className="modal"
                style={width ? { maxWidth: width } : undefined}
                onMouseDown={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <header className="modal__head">
                    <h2 className="modal__title">{title}</h2>
                    <button className="modal__close" onClick={onClose} aria-label="닫기">
                        ✕
                    </button>
                </header>

                {description && <p className="modal__desc">{description}</p>}

                <div className="modal__body">{children}</div>

                {footer && <div className="modal__actions">{footer}</div>}
            </div>
        </div>
    );
}
