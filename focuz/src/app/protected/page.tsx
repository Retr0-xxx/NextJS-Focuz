import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function ProtectedRoute() {
   const session = await getServerSession();
    if(!session || !session.user) {
        redirect("/api/auth/signin");
    }
    return(
        <div>
            This is a protected route.
            <br />
            You should only see this if you're signed in!
        </div>
    );
}