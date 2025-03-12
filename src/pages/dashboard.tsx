"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { apiRequest } from "../utils/apiHelper";

export default function Dashboard() {
    const { data: session, status } = useSession();
    const [pets, setPets] = useState<{ petName: string; petId: string; statuses: { type: string; lastValue: string }[] }[]>([]);
    const [selectedPetIndex, setSelectedPetIndex] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [petName, setPetName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPets = async () => {
            if (session?.user.id) {
                try {
                    const queryParams = new URLSearchParams({ userId: session.user.id }).toString();
                    const data = await apiRequest(`fetch_user?${queryParams}`, "GET");
                    setPets(data.pets || []);
                } catch (err) {
                    setError("Failed to load pets");
                }
            }
        };
        
        if (status === "authenticated") {
            fetchPets();
        }
    }, [session, status]);

const updateStats = async (petId: string, statType: string) => {
  if (!session?.user?.id) {
    console.warn("Session or user ID not available.");
    setError("User session is invalid. Please log in.");
    return;
}
  try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!apiUrl) {
          setError("API Gateway URL not configured.");
          return;
      }

      // Find the selected pet
      const selectedPet = pets.find((pet) => pet.petId === petId);

      if (!selectedPet) {
          setError(`Pet with ID ${petId} not found.`);
          return;
      }

      // Find the status object matching the statType
      const status = selectedPet.statuses.find((s) => s.type === statType);

      if (!status) {
          setError(`Status ${statType} not found for pet ${petId}.`);
          return;
      }

      const statusId = status.type; // Extract statusId (type)
      const incrementValue = 10; 

      const response = await fetch(`${apiUrl}/update_status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              statusId: statusId,
              petId: petId,
              incrementValue: incrementValue,
          }),
      });

      if (!response.ok) {
          throw new Error('Failed to update stats');
      }

      const queryParams = new URLSearchParams({ userId: session.user.id }).toString();
      const data = await apiRequest(`fetch_user?${queryParams}`, "GET");
      setPets(data.pets || []);

  } catch (err) {
      setError(`Error updating ${statType}: ${String(err)}`);
  }
};
     

    const handleCreatePet = async () => {
        if (!petName) return;
        setLoading(true);
        setError("");

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL; 
            if (!apiUrl) {
              setError("API Gateway URL not configured.");
              return;
            }
            const response = await fetch(`${apiUrl}/create_pet`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: session?.user.id, name: petName }),
            });

            if (!response.ok) {
                throw new Error("Failed to create pet");
            }

            setShowModal(false);
            setPetName("");
            setLoading(false);
        } catch (err) {
            setError("Error creating pet. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading") return <p>Loading...</p>;
    if (!session) return <p className="text-center text-xl">PLEASE SIGN IN</p>;

    return (
        <div className="p-6 w-full h-screen flex flex-col">
            {pets.length === 0 ? (
                <div className="text-center flex-grow flex flex-col items-center justify-center">
                    <p className="text-lg font-bold">NO PETS</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                    >
                        Create Pet
                    </button>
                </div>
            ) : (
                <div className="flex-grow flex max-h-2/4">
                    {/* Left Side: Pet Image and Name */}
                    <div className="w-1/2 h-4/5 flex flex-col items-center justify-center p-4 bg-gray-200 rounded">
                        <h2 className="text-2xl font-bold">{pets[selectedPetIndex].petName}</h2>
                        <img src="blob.png" alt="Pet" className="w-60 h-60 mt-4" />
                    </div>

                    {/* Right Side: Statuses and Buttons */}
                    <div className="w-1/2 flex flex-col p-4 ml-auto">
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={() => setShowModal(true)}
                                className="px-4 py-2 bg-blue-500 text-white rounded"
                            >
                                Create Pet
                            </button>
                        </div>
                        <div className="w-full">
                            {pets[selectedPetIndex].statuses.map((status) => (
                                <div key={status.type} className="mb-2">
                                    <p className="capitalize">{status.type}</p>
                                    <div className="w-full bg-gray-300 rounded-full h-4">
                                        <div
                                            className="bg-green-500 h-4 rounded-full"
                                            style={{ width: `${status.lastValue}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex gap-4 justify-end">
                          <button
                            className="px-4 py-2 bg-green-500 text-white rounded"
                            onClick={() => updateStats(pets[selectedPetIndex].petId, "hunger")}
                          >
                            Feed
                          </button>
                          <button
                            className="px-4 py-2 bg-yellow-500 text-white rounded"
                            onClick={() => updateStats(pets[selectedPetIndex].petId, "hygiene")}
                          >
                            Clean
                          </button>
                          <button
                            className="px-4 py-2 bg-blue-500 text-white rounded"
                            onClick={() => updateStats(pets[selectedPetIndex].petId, "sleep")}
                           >
                            Rest
                          </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pet Carousel */}
            {pets.length > 1 && (
                <div className="mt-6 p-6 flex gap-5 overflow-x-auto justify-center">
                    {pets.map((pet, index) => (
                        <button
                            key={pet.petId}
                            onClick={() => setSelectedPetIndex(index)}
                            className={`px-3 py-1 rounded-full flex flex-col items-center ${selectedPetIndex === index ? "bg-blue-500 text-white" : "bg-gray-300"}`}
                        >
                            <img src="blob.png" alt="Pet" className="w-15 h-15 mt-2" />
                            <span className="mt-1">{pet.petName}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Create Pet Modal */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-opacity-50">
                    <div className="bg-gray-400 p-6 rounded-2xl shadow-lg w-80 text-white">
                        <h2 className="text-lg font-semibold">Create a New Pet!</h2>
                        <input
                            type="text"
                            value={petName}
                            onChange={(e) => setPetName(e.target.value)}
                            placeholder="Enter pet name"
                            className="mt-3 w-full p-2 border rounded"
                        />
                        {error && <p className="text-red-500 mt-2">{error}</p>}
                        <button
                            onClick={handleCreatePet}
                            disabled={loading}
                            className="mt-3 w-full px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
                        >
                            {loading ? "Creating..." : "Create Pet"}
                        </button>
                        <button
                            onClick={() => setShowModal(false)}
                            className="mt-2 w-full px-4 py-2 bg-blue-500 text-white rounded"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}