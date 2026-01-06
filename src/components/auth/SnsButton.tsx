type Props = {
    image: string;
    label: string;
    onClick: () => void;
    disabled?: boolean;
};

export default function SnsButton({
                                      image,
                                      label,
                                      onClick,
                                      disabled,
                                  }: Props) {
    return (
        <button
            type="button"
            className="sns-image-btn"
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
            aria-label={label}
            style={{ backgroundImage: `url(${image})` }}
        />
    );
}
