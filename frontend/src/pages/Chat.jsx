import AppLayout from "../components/Layout/AppLayout";
import CareerAssistant from "../components/Chat/CareerAssistant";

export default function Chat() {
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-140px)] min-h-0">
        <CareerAssistant variant="standalone" />
      </div>
    </AppLayout>
  );
}
