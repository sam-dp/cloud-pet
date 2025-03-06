import { GetServerSidePropsContext } from 'next';
import { getSession } from 'next-auth/react';
import { useSession, signOut } from 'next-auth/react';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}

export default function Dashboard() {
  const { data: session } = useSession();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {session?.user?.email}!</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}