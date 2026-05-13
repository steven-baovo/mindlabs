import dynamic from "next/dynamic";

const MindAIClient = dynamic(() => import("@/components/mindai/MindAIClient"), {
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#fcfcfc]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-3 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-sm text-gray-500 font-medium">Khởi tạo MindAI...</p>
      </div>
    </div>
  )
});

export const metadata = {
  title: "mindAI | Mindlabs Agent",
  description: "Advanced AI Agent powered by custom skills.",
};

export default function MindAIPage() {
  return <MindAIClient />;
}
