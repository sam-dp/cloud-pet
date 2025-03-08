import { useEffect, useState } from "react";
import { apiRequest } from "../utils/apiHelper";

export default function UserProfile() {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await apiRequest("fetch_user"); // Calls API Gateway
        setUserData(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchUserData();
  }, []);

  if (error) return <p>Error: {error}</p>;
  if (!userData) return <p>Loading...</p>;

  return <div>!</div>;
}
