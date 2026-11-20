import { getAuthSession } from "@/lib/auth/session";
import FarmList from "@/features/farms/components/farm-list";

export default async function FarmPage() {
  const { user } = await getAuthSession();

  return (
    <div className="rounded-2xl px-6 shadow-xs border border-gray-100 dark:border-gray-800">
      <FarmList currentUser={user} />
    </div>
  );
}
