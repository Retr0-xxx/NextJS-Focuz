"use client";
import { useEffect, useState } from "react";
import Img from "./Img";
import { getPlantData } from "@/utils/db";

interface PlantInfo {
  growth: number;
  water: number;
  death: number;
}

// Existing function to water the plant
async function waterPlant() {
  try {
    const response = await fetch("/api/waterPlant", {
      method: "POST",
      body: JSON.stringify({ amount: 20 }),
    });
    if (!response.ok) {
      throw new Error("Failed to water plant");
    }
  } catch (error) {
    console.error("Error watering plant:", error);
  }
}

// **New** function to run the periodic job
async function runPeriodicJob() {
  try {
    const response = await fetch("/api/periodicJob", {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error("Failed to run periodic job");
    }
    console.log("Periodic job executed successfully");
  } catch (error) {
    console.error("Error running periodic job:", error);
  }
}

export default function Plant() {
  const [plantInfo, setPlantInfo] = useState<PlantInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Move fetchPlantInfo into its own function so we can call it anywhere
  const fetchPlantInfo = async () => {
    setLoading(true);
    try {
      const apiResponse = await fetch("/api/plantInfo");
      const { info }: { info: PlantInfo } = await apiResponse.json();
      setPlantInfo(info);
    } catch (error) {
      console.error("Failed to fetch plant info:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Use the new function in useEffect to fetch info on component mount
  useEffect(() => {
    fetchPlantInfo();
  }, []);

  // 3. Create a handler that first waters the plant, then refetches info
  const handleWaterPlant = async () => {
    await waterPlant();
    await fetchPlantInfo(); // re-fetch after watering
  };

  // **4. Handler to trigger the periodic job**
  const handleRunPeriodicJob = async () => {
    await runPeriodicJob();
    await fetchPlantInfo();
  };

  return (
    <div>
      <h1>Plant Information</h1>
      {loading ? (
        <p>Loading...</p>
      ) : plantInfo ? (
        <div>
          <p>
            <strong>death:</strong> {plantInfo.death}
          </p>
          <p>
            <strong>growth:</strong> {plantInfo.growth}
          </p>
          <p>
            <strong>water:</strong> {plantInfo.water}
          </p>
          <button onClick={handleWaterPlant}>Water Plant</button>

          <button onClick={handleRunPeriodicJob}>Run Periodic Job</button>
          <Img />
        </div>
      ) : (
        <p>Failed to load plant information.</p>
      )}
    </div>
  );
}
