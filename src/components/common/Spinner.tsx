type Props = {
    label?: string;
};

export default function Spinner({ label = "불러오는 중..." }: Props) {
    return (
        <div className="spinner">
            <span className="spinner__dot" />
            <span className="spinner__text">{label}</span>
        </div>
    );
}
