import { Compass } from "lucide-react";
import { Card } from "./Card";

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <Card className="flex flex-col items-center justify-center py-10 text-center">
      <Compass className="mb-3 h-9 w-9 text-teal-600" />
      <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">{body}</p>
    </Card>
  );
}
