interface CircularImageProps {
  src: string;
  alt: string;
  onClick?: () => void;
}
export function CircularImage({ src, alt, onClick }: CircularImageProps) {
  return (
    <div className="flex items-center justify-center p-4 overflow-visible">
      <img
        src={src}
        alt={alt}
        onClick={onClick}
        className="h-28 w-28 rounded-full object-cover object-center hover:z-50 hover:scale-107"
      />
    </div>
  );
}
