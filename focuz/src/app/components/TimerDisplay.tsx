"use client";
import React, { useEffect, useState } from "react";

function TimerDisplay() {
    const [elapsedTime, setElapsedTime] = useState(0);
    const [loading, setLoading] = useState(true);
    const [timerSetting, setTimerSetting] = useState(1000); // Default timer setting

    // Array of timer values
    const timerValues = [1000, 2000, 3000, 4000, 5000];

    // Function to fetch timer data
    async function fetchTimerData() {
        try {
            const response = await fetch("/api/playerState");
            if (!response.ok) {
                throw new Error("Failed to fetch timer data");
            }
            const data = await response.json();
            if (data.shouldRedirect === true) {
                document.exitFullscreen();
            }
            setElapsedTime(data.elapsedTime || 0);
        } catch (error) {
            console.error("Error fetching timer data:", error);
        } finally {
            setLoading(false);
        }
    }

    // Function to update the timer setting
    async function updateTimerSetting() {
        const nextIndex = (timerValues.indexOf(timerSetting) + 1) % timerValues.length;
        const newSetting = timerValues[nextIndex];
        setTimerSetting(newSetting);

        try {
            const response = await fetch("/api/timerSetting", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ timerSetting: newSetting }),
            });

            if (!response.ok) {
                throw new Error("Failed to update timer setting");
            }

            console.log(`Timer setting updated to ${newSetting}`);
        } catch (error) {
            console.error("Error updating timer setting:", error);
        }
    }

    // Effect to fetch timer data on component mount
    useEffect(() => {
        const interval = setInterval(() => {
            fetchTimerData();
        }, 100); // Poll every 100ms

        // Cleanup interval on component unmount
        return () => {
            clearInterval(interval);
        };
    }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div  className="absolute top-3/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <button
                onClick={() => {
                    console.log("Button clicked");
                    updateTimerSetting();
                }}
                  className="text-[#ED6A40] text-[10vh] hover:scale-150  transition"
            >
                {timerSetting}
            </button>
            <p>Elapsed Time: {elapsedTime} ms</p>
        </div>
    );
}

export default TimerDisplay;
