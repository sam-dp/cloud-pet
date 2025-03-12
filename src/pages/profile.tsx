import { useEffect, useState } from "react";
import { apiRequest } from "../utils/apiHelper";
import { useSession } from "next-auth/react";

export default function UserProfile() {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");
  const { data: session, status } = useSession();
  useEffect(() => {
    const fetchUserData = async () => {
      if(session?.user.id){
        try {
          const queryParams = new URLSearchParams({ userId: session.user.id }).toString();
          const data = await apiRequest(`fetch_user?${queryParams}`, "GET"); // Calls API Gateway
          setUserData(data);
        } catch (err: any) {
          setError(err.statusCode + " " + err.message);
        }
      }
    };

    if (status === "authenticated") {
      fetchUserData();
    }
  }, [session, status]);

  if (error) return <p>Profile Error: {error}</p>;
  if (!userData) return <p>Loading...</p>;
  console.log(JSON.stringify(userData));
  return <div><p>User Data: {JSON.stringify(userData)}</p></div>;
}
