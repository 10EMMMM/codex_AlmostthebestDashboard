import ChartBarDefault from "@/components/patterns/chart-bar-default";

export default function TestPatternPage() {
    return (
        <div className="p-10 flex flex-col items-center justify-center min-h-screen gap-8">
            <h1 className="text-2xl font-bold">Pattern Test: Chart Bar Default</h1>
            <ChartBarDefault />
        </div>
    );
}
