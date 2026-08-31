type Props = {
    name: string | null;
    size?: number;
};

/** 이름 첫 글자로 만드는 간단한 아바타. 이름별로 색이 고정된다. */
export default function Avatar({ name, size = 24 }: Props) {
    if (!name) {
        return (
            <span
                className="avatar avatar--empty"
                style={{ width: size, height: size }}
                title="담당자 없음"
            >
                –
            </span>
        );
    }

    // 이름을 해시해 색을 고르면 같은 사람은 항상 같은 색이 된다.
    const hue = Array.from(name).reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 360;

    return (
        <span
            className="avatar"
            style={{
                width: size,
                height: size,
                background: `hsl(${hue} 62% 46%)`,
                fontSize: size * 0.42,
            }}
            title={name}
        >
            {name.trim().charAt(0)}
        </span>
    );
}
