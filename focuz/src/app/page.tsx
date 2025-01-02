import { getServerSession } from "next-auth";

export default async function Home() {
  const session = await getServerSession();

  return (
    <div className="text-[#FCB7AB] text-9xl flex items-center justify-center h-screen">
      Home
    </div>
  );
}
