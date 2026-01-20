'use client';

type GameHUDProps = {
  timer: number;
  difficulty: string;
  onQuit: () => void;
};

export default function GameHUD({ timer, difficulty, onQuit }: GameHUDProps) {
  return (
    <div className="flex justify-between items-center w-full max-w-md px-2">
      <div className="panel px-3 py-1.5 text-sm">
        ⏱ {timer}s
      </div>

      <div className="panel px-3 py-1.5 text-sm text-purple-400 font-medium">
        {difficulty.toUpperCase()}
      </div>

      <button
        onClick={onQuit}
        className="px-3 py-1.5 bg-red-900/50 border border-red-800 rounded-lg text-xs hover:bg-red-800/50"
      >
        QUIT
      </button>
    </div>
  );
}
