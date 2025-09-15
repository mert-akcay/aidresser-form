import { cn } from "@/lib/utils";

interface SelectionCardProps {
  id: string;
  image: string;
  description: string;
  selected: boolean;
  onClick: (id: string) => void;
  className?: string;
}

export const SelectionCard = ({ 
  id, 
  image, 
  description, 
  selected, 
  onClick, 
  className 
}: SelectionCardProps) => {
  return (
    <div
      className={cn(
        "relative cursor-pointer rounded-xl overflow-hidden",
        "bg-gradient-to-br from-card to-secondary/50",
        "border-2 transition-all duration-300 ease-out",
        "hover:scale-105 hover:shadow-lg",
        selected 
          ? "border-primary shadow-[var(--shadow-selected)] scale-105" 
          : "border-border hover:border-primary/50",
        className
      )}
      onClick={() => onClick(id)}
    >
      <div className="aspect-square overflow-hidden">
        <img 
          src={image} 
          alt={description}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        />
      </div>
      
      {selected && (
        <div className="absolute top-3 right-3">
          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
            <svg 
              className="w-4 h-4 text-primary-foreground" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
        </div>
      )}

      <div className="p-4 bg-gradient-to-t from-card/95 to-card/80 backdrop-blur-sm">
        <h3 className="text-sm font-medium text-card-foreground text-center">
          {description}
        </h3>
      </div>
    </div>
  );
};