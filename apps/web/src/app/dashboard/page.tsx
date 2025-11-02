import { headers } from "next/headers";
import { auth } from "@sepupus-account/auth";
import Dashboard from "./dashboard";

export default async function DashboardPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	return <Dashboard session={session!} />;
}
