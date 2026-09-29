import { cn } from "../../lib/utils";

interface QuestionNavigatorProps {
  total: number;
  current: number;
  answers: Record<number, string>;
  flagged: number[];
  onSelect: (index: number) => void;
}

export function QuestionNavigator({ total, current, answers, flagged, onSelect }: QuestionNavigatorProps) {
  const getStatusClass = (idx: number) => {
    const isAnswered = answers[idx] !== undefined;
    const isFlagged = flagged.includes(idx);
    
    let baseClass = "bg-background border-input hover:bg-muted text-foreground";
    if (isAnswered && !isFlagged) {
      baseClass = "bg-green-600 text-white border-green-600";
    } else if (isFlagged && !isAnswered) {
      baseClass = "bg-purple-600 text-white border-purple-600";
    } else if (isFlagged && isAnswered) {
      // Answered and marked for review (e.g., purple with a green indicator or just distinct)
      baseClass = "bg-purple-600 text-white border-green-400 border-2";
    }

    if (idx === current) {
      return cn(baseClass, "ring-2 ring-primary ring-offset-2");
    }
    return baseClass;
  };

  return (
    <div className="grid grid-cols-5 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 overflow-y-auto max-h-[400px] p-1">
      {Array.from({ length: total }).map((_, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(idx)}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-md border text-sm font-medium transition-colors relative",
            getStatusClass(idx)
          )}
        >
          {idx + 1}
          {answers[idx] !== undefined && flagged.includes(idx) && (
             <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border border-white" />
          )}
        </button>
      ))}
    </div>
  );
}
