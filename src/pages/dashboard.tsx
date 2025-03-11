"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";

export async function getServerSideProps(context: GetServerSidePropsContext) {
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

export default function Dashboard() {
    const { data: session } = useSession();
    const [showModal, setShowModal] = useState(false);
    const [petName, setPetName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!session) return <p>Loading...</p>;

    const handleCreatePet = async () => {
        if (!petName) return;
        setLoading(true);
        setError("");

        try {
            const response = await fetch("https://vdkdrawhpd.execute-api.us-west-2.amazonaws.com/create_pet", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: session.user.email, name: petName }),
            });

            if (!response.ok) {
                throw new Error("Failed to create pet");
            }

            const data = await response.json();
            console.log("Pet Created:", data);
            setShowModal(false);
        } catch (err) {
            setError("Error creating pet. Please try again.");
        } finally {
            setLoading(false);
            setPetName("");
        }
    };

    return (
        <div className="p-6">
            {/* Create Pet Button */}
            <button
                onClick={() => setShowModal(true)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            >
                Create Pet
            </button>

            {/* Modal for Creating a Pet */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-opacity-50">
                    <div className="bg-gray-400 p-6 rounded-2xl shadow-lg w-80 text-white">
                        <h2 className="text-lg font-semibold">Create a New Pet!</h2>

                        {/* Input Field */}
                        <input
                            type="text"
                            value={petName}
                            onChange={(e) => setPetName(e.target.value)}
                            placeholder="Enter pet name"
                            className="mt-3 w-full p-2 border rounded"
                        />

                        {/* Error Message */}
                        {error && <p className="text-red-500 mt-2">{error}</p>}

                        {/* Create Button */}
                        <button
                            onClick={handleCreatePet}
                            disabled={loading}
                            className="mt-3 w-full px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
                        >
                            {loading ? "Creating..." : "Create Pet"}
                        </button>

                        {/* Close Button */}
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
