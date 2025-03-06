import { getSession, GetSessionParams } from "next-auth/react";
import { useSession, signOut } from "next-auth/react";

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/api/auth/signin",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}

export default function Dashboard({ session }) {
  const { data: sessionClient } = useSession();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {sessionClient?.user?.email}!</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}