// src/components/project/ColumnManager.tsx
import { useState } from "react";
import { createColumn, deleteColumn, moveColumn, updateColumn } from "@/api/column";
import { describeApiError } from "@/api/common";
import { COLUMN_ERROR_MESSAGES } from "@/constants/columnMessages";
import { CATEGORY_LABEL, type BoardColumn, type ColumnCategory } from "@/types/project";
import ColumnRow from "./ColumnRow";
import "@/styles/column.css";

type Props = {
    projectId: number;
    columns: BoardColumn[];
    canManage: boolean;
    /** 서버가 돌려준 새 컬럼 목록. 부르는 쪽이 프로젝트 정보에 반영한다(머리글·보드가 같은 값을 보게). */
    onChange: (columns: BoardColumn[]) => void;
};

/**
 * 보드 컬럼 관리 (설정 탭, 로드맵 B5). 추가 · 이름 변경 · 성격 변경 · 순서 변경(한 칸) · 삭제.
 *
 * <p>요청은 한 번에 하나만 보낸다. 순서 바꾸기를 빠르게 연달아 누르면 응답 순서가 뒤집혀
 * 화면이 한 박자 늦은 목록으로 돌아갈 수 있다.
 */
export default function ColumnManager({ projectId, columns, canManage, onChange }: Props) {
    const [busy, setBusy] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [newName, setNewName] = useState("");
    const [newCategory, setNewCategory] = useState<ColumnCategory>("IN_PROGRESS");

    /** 요청 하나를 감싼다. 성공하면 목록을 갈아 끼우고 true. */
    const run = async (call: () => Promise<BoardColumn[]>, fallback: string): Promise<boolean> => {
        setErrorMsg(null);
        setBusy(true);
        try {
            onChange(await call());
            return true;
        } catch (err) {
            setErrorMsg(describeApiError(err, COLUMN_ERROR_MESSAGES, fallback));
            return false;
        } finally {
            setBusy(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        const name = newName.trim();
        if (!name || busy) return;
        const ok = await run(
            () => createColumn(projectId, { name, category: newCategory }),
            "컬럼을 추가하지 못했어요."
        );
        if (ok) setNewName("");
    };

    const handleDelete = (column: BoardColumn) => {
        if (!window.confirm(`"${column.name}" 컬럼을 지울까요?\n이슈가 남아 있으면 지워지지 않습니다.`)) return;
        void run(() => deleteColumn(projectId, column.id), "컬럼을 지우지 못했어요.");
    };

    return (
        <section className="section">
            <h2 className="section__title">보드 컬럼 ({columns.length})</h2>

            {errorMsg && (
                <div className="alert member-alert">
                    <span>{errorMsg}</span>
                    <button
                        type="button"
                        className="member-alert__close"
                        aria-label="닫기"
                        onClick={() => setErrorMsg(null)}
                    >
                        ×
                    </button>
                </div>
            )}

            <div className="col-list">
                {columns.map((c, i) => (
                    <ColumnRow
                        key={c.id}
                        column={c}
                        index={i}
                        total={columns.length}
                        canManage={canManage}
                        busy={busy}
                        onRename={(col, name) =>
                            run(() => updateColumn(projectId, col.id, { name }), "이름을 바꾸지 못했어요.")
                        }
                        onChangeCategory={(col, category) =>
                            void run(
                                () => updateColumn(projectId, col.id, { category }),
                                "성격을 바꾸지 못했어요."
                            )
                        }
                        onMove={(col, offset) =>
                            void run(() => moveColumn(projectId, col.id, offset), "옮기지 못했어요.")
                        }
                        onDelete={handleDelete}
                    />
                ))}
            </div>

            {canManage && (
                <form className="colm-add" onSubmit={handleAdd}>
                    <input
                        className="field__input colm-add__name"
                        placeholder="새 컬럼 이름 (예: 코드 리뷰)"
                        value={newName}
                        maxLength={50}
                        disabled={busy}
                        onChange={(e) => setNewName(e.target.value)}
                    />
                    <select
                        className="field__input colm-add__cat"
                        value={newCategory}
                        disabled={busy}
                        aria-label="새 컬럼 성격"
                        onChange={(e) => setNewCategory(e.target.value as ColumnCategory)}
                    >
                        {(["TODO", "IN_PROGRESS", "DONE"] as ColumnCategory[]).map((c) => (
                            <option key={c} value={c}>
                                {CATEGORY_LABEL[c]}
                            </option>
                        ))}
                    </select>
                    <button
                        type="submit"
                        className="btn btn--primary btn--auto btn--sm"
                        disabled={busy || !newName.trim()}
                    >
                        + 컬럼 추가
                    </button>
                </form>
            )}

            <p className="field__hint" style={{ marginTop: 10 }}>
                새 컬럼은 맨 오른쪽에 붙습니다. 이슈는 <b>첫 번째 컬럼</b>에서만 만들고, 카드는 한 칸씩만 옮깁니다.
                "성격"은 이름과 별개로 통계·완료 판단에 쓰입니다.
                {canManage ? " 이슈가 남아 있는 컬럼은 지울 수 없습니다." : " 컬럼은 소유자만 바꿀 수 있습니다."}
            </p>
        </section>
    );
}
