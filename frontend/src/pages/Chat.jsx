import AppLayout from "../components/Layout/AppLayout";
import CareerAssistant from "../components/Chat/CareerAssistant";

export default function Chat() {
  return (
    <AppLayout>
      <div className="w-full flex flex-col flex-1 min-h-0">
        <CareerAssistant variant="standalone" />
      </div>
    </AppLayout>
  );
}
