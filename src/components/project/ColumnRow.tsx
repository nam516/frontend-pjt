// src/components/project/ColumnRow.tsx
import { useState } from "react";
import { CATEGORY_LABEL, type BoardColumn, type ColumnCategory } from "@/types/project";

const CATEGORIES: ColumnCategory[] = ["TODO", "IN_PROGRESS", "DONE"];

type Props = {
    column: BoardColumn;
    index: number;
    total: number;
    canManage: boolean;
    /** 이 줄에 요청이 나가 있거나 다른 줄이 요청 중이면 잠근다 */
    busy: boolean;
    onRename: (column: BoardColumn, name: string) => Promise<boolean>;
    onChangeCategory: (column: BoardColumn, category: ColumnCategory) => void;
    onMove: (column: BoardColumn, offset: -1 | 1) => void;
    onDelete: (column: BoardColumn) => void;
};

/** 보드 컬럼 한 줄 (설정 탭, B5). OWNER 가 아니면 읽기 전용으로 그린다. */
export default function ColumnRow({
    column,
    index,
    total,
    canManage,
    busy,
    onRename,
    onChangeCategory,
    onMove,
    onDelete,
}: Props) {
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(column.name);

    const save = async () => {
        const trimmed = name.trim();
        if (!trimmed || trimmed === column.name) {
            setEditing(false);
            setName(column.name);
            return;
        }
        if (await onRename(column, trimmed)) setEditing(false);
    };

    return (
        <div className="col-row colm-row">
            <span className="col-row__order">{index + 1}</span>

            {editing ? (
                <input
                    className="field__input colm-row__input"
                    value={name}
                    maxLength={50}
                    autoFocus
                    disabled={busy}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") void save();
                        if (e.key === "Escape") {
                            setEditing(false);
                            setName(column.name);
                        }
                    }}
                />
            ) : (
                <span className="col-row__name">{column.name}</span>
            )}

            {index === 0 && (
                <span className="badge colm-row__first" title="이슈는 이 컬럼에서만 만들어집니다">
                    이슈 생성
                </span>
            )}

            <span className="col-row__spacer" />

            {canManage ? (
                <>
                    <select
                        className="field__input colm-row__cat"
                        value={column.category}
                        disabled={busy}
                        aria-label="컬럼 성격"
                        title="통계·완료 판단에 쓰이는 성격"
                        onChange={(e) => onChangeCategory(column, e.target.value as ColumnCategory)}
                    >
                        {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                                {CATEGORY_LABEL[c]}
                            </option>
                        ))}
                    </select>

                    <button
                        type="button"
                        className="btn btn--outline btn--auto btn--sm colm-row__icon"
                        title="왼쪽으로"
                        aria-label="왼쪽으로"
                        disabled={busy || index === 0}
                        onClick={() => onMove(column, -1)}
                    >
                        ←
                    </button>
                    <button
                        type="button"
                        className="btn btn--outline btn--auto btn--sm colm-row__icon"
                        title="오른쪽으로"
                        aria-label="오른쪽으로"
                        disabled={busy || index === total - 1}
                        onClick={() => onMove(column, 1)}
                    >
                        →
                    </button>

                    {editing ? (
                        <button
                            type="button"
                            className="btn btn--primary btn--auto btn--sm"
                            disabled={busy}
                            onClick={() => void save()}
                        >
                            저장
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="btn btn--outline btn--auto btn--sm"
                            disabled={busy}
                            onClick={() => {
                                setName(column.name);
                                setEditing(true);
                            }}
                        >
                            이름
                        </button>
                    )}

                    <button
                        type="button"
                        className="btn btn--danger btn--auto btn--sm"
                        disabled={busy || total <= 1}
                        title={total <= 1 ? "마지막 남은 컬럼은 지울 수 없어요" : "컬럼 삭제"}
                        onClick={() => onDelete(column)}
                    >
                        삭제
                    </button>
                </>
            ) : (
                <span className={`badge badge--${column.category.toLowerCase()}`}>
                    {CATEGORY_LABEL[column.category]}
                </span>
            )}
        </div>
    );
}
