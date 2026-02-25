import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Props {
  avatar: string;
  pseudo: string;
  options: { id: number; url: string }[];
  onSelect: (url: string) => void;
}

const AvatarSelector: React.FC<Props> = ({
  avatar,
  pseudo,
  options,
  onSelect,
}) => {
  return (
    <div className="flex flex-col gap-3 justify-center items-center md:w-2/6 w-full">
      <div className="w-32 h-32 rounded-full border-4 p-1">
        <Avatar className="w-full h-full">
          <AvatarImage src={avatar} />
          <AvatarFallback>{pseudo?.[0]}</AvatarFallback>
        </Avatar>
      </div>

      <p className="magic-text py-1">{pseudo}</p>

      <div className="grid grid-cols-3 gap-6 mb-10 w-fit mx-auto">
        {options.map(av => (
          <button
            key={av.id}
            onClick={() => onSelect(av.url)}
            className={`w-16 h-16 p-1 rounded-full overflow-hidden border-2 transition-all ${
              avatar === av.url
                ? 'border-orange-500 scale-110 shadow-md'
                : 'border-transparent opacity-50'
            }`}
          >
            <img
              src={av.url}
              alt="avatar option"
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default AvatarSelector;
