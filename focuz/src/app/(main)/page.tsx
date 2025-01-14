import { getServerSession } from "next-auth";
import RedirectButton from "../components/RedirectButton";
import ScoreSummary from "../components/ScoreSummary";
import Plant from "../components/Plant";

export default async function Home() {
  const session = await getServerSession();

  return (
    <>
      <ScoreSummary />
      <div className="pl-[2vw] pt-[2vh]">
        <RedirectButton route="/game" className="text-[#FCB7AB] text-[15vh] hover:scale-110 transition">
          start focus
        </RedirectButton>
        <Plant />
      </div>
    </>
  );
}
