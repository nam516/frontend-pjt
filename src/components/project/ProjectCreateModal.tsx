import { useState } from "react";
import { createProject } from "@/api/project";
import { extractApiErrorMsg } from "@/api/auth";
import type { ProjectDetail } from "@/types/project";

type Props = {
    onClose: () => void;
    onCreated: (project: ProjectDetail) => void;
};

export default function ProjectCreateModal({ onClose, onCreated }: Props) {
    const [projectKey, setProjectKey] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const keyValid = /^[A-Za-z][A-Za-z0-9]{1,9}$/.test(projectKey);
    const canSubmit = keyValid && name.trim().length > 0 && !saving;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        setErrorMsg(null);
        setSaving(true);
        try {
            const created = await createProject({
                projectKey: projectKey.trim(),
                name: name.trim(),
                description: description.trim() || undefined,
            });
            onCreated(created);
        } catch (err) {
            setErrorMsg(extractApiErrorMsg(err, "프로젝트를 만들지 못했어요."));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-backdrop" onMouseDown={onClose}>
            <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
                <h2 className="modal__title">새 프로젝트</h2>
                <p className="modal__desc">
                    프로젝트를 만들면 <b>할 일 · 진행 중 · 완료</b> 컬럼이 자동으로 생성됩니다.
                </p>

                <form onSubmit={handleSubmit}>
                    {errorMsg && <div className="alert">{errorMsg}</div>}

                    <div className="field">
                        <label className="field__label" htmlFor="projectKey">
                            프로젝트 키
                        </label>
                        <input
                            id="projectKey"
                            className="field__input field__input--mono"
                            value={projectKey}
                            onChange={(e) => setProjectKey(e.target.value)}
                            placeholder="PJT"
                            maxLength={10}
                            autoFocus
                        />
                        <p className="field__hint">
                            이슈 번호 앞에 붙습니다. 예) PJT → PJT-1, PJT-2 · 영문으로 시작하는 2~10자
                        </p>
                    </div>

                    <div className="field">
                        <label className="field__label" htmlFor="name">
                            프로젝트 이름
                        </label>
                        <input
                            id="name"
                            className="field__input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="이슈 트래커"
                            maxLength={100}
                        />
                    </div>

                    <div className="field">
                        <label className="field__label" htmlFor="description">
                            설명 <span style={{ fontWeight: 400 }}>(선택)</span>
                        </label>
                        <textarea
                            id="description"
                            className="field__textarea"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="어떤 일을 관리하는 프로젝트인가요?"
                            maxLength={1000}
                        />
                    </div>

                    <div className="modal__actions">
                        <button
                            type="button"
                            className="btn btn--outline"
                            onClick={onClose}
                            disabled={saving}
                        >
                            취소
                        </button>
                        <button type="submit" className="btn btn--primary" disabled={!canSubmit}>
                            {saving ? "만드는 중..." : "만들기"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
