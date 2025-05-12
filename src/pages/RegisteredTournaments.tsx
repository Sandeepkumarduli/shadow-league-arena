
import DashboardLayout from "@/components/DashboardLayout";

const RegisteredTournaments = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Registered Tournaments</h1>
        <p className="text-gray-400">View tournaments you have registered for</p>
      </div>
    </DashboardLayout>
  );
};

export default RegisteredTournaments;
