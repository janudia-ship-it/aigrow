import FarmList from "@/features/farms/components/farm-list";


export default function FarmPage() {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-xs border border-gray-100">
      <h1 className="text-xl font-bold text-[#004C4B]">My Farm</h1>
      <p className="mt-2 text-sm text-gray-500">Farm management features coming soon.</p>
      <FarmList />
    </div>
  );
}

