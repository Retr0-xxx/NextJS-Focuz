import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import RedirectButton from "../components/RedirectButton";
import ScoreSummary from "../components/ScoreSummary";

export default async function Home() {
  const session = await getServerSession();

  return (
    <>
      <ScoreSummary />
      <div className="flex justify-center items-center">
        <RedirectButton route="/game" className="text-[#FCB7AB] text-[15vh] hover:scale-110 transition">
          start focus
        </RedirectButton>
      </div>
    </>
  );
}
