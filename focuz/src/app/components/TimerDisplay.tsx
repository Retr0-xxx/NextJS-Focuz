"use client";
import React, { useEffect, useState } from "react";

function TimerDisplay() {
    const [elapsedTime, setElapsedTime] = useState(0);
    const [loading, setLoading] = useState(true);
    const [timerSetting, setTimerSetting] = useState(1000); // Default timer setting
    const [isButtonVisible, setButtonVisible] = useState(true);

    // Array of timer values
    const timerValues = [1000, 2000, 3000, 4000, 5000,1000*60*5];

    // Function to fetch timer data
    async function fetchTimerData() {
        try {
            const response = await fetch("/api/playerState");
            console.log("response is: ", response);
            if (!response.ok) {
                throw new Error("Failed to fetch timer data");
            }
            const data = await response.json();
            if (data.shouldRedirect === true) {
                console.log("exiting fullscreen");
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

    async function updateTimerSettingInit() {
        try {
            const response = await fetch("/api/timerSetting", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ timerSetting: timerSetting }),
            });

            if (!response.ok) {
                throw new Error("Failed to update timer setting");
            }

            console.log(`Timer setting updated to ${timerSetting}`);
        } catch (error) {
            console.error("Error updating timer setting:", error);
        }
    }

    useEffect(() => {
            function handleFullscreenChange() {
                const isFullscreen = !!document.fullscreenElement;
                setButtonVisible(!isFullscreen);
            }
    
            document.addEventListener("fullscreenchange", handleFullscreenChange);
    
            return () => {
                document.removeEventListener("fullscreenchange", handleFullscreenChange);
            };
        }, []);
    

    // Effect to fetch timer data on component mount
    useEffect(() => {
        const interval = setInterval(() => {
            fetchTimerData();
        }, 200); // Poll every 200ms

        // Cleanup interval on component unmount
        return () => {
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        updateTimerSettingInit();
    }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    const formatElapsedTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
    
        const parts = [];
        if (hours > 0) parts.push(`${hours}h`);
        if (remainingMinutes > 0) parts.push(`${remainingMinutes}m`);
        if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`); // Always show seconds if nothing else
    
        return parts.join(" ");
    };

    return (
        <div  className="absolute top-3/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            {isButtonVisible && (   
                <button
                    onClick={() => {
                        console.log("Button clicked");
                        updateTimerSetting();
                    }}
                    className="text-[#ED6A40] text-[10vh] hover:scale-150  transition"
                >
                    {formatElapsedTime(timerSetting)}
                </button>
            )}
            <p>Elapsed Time: {elapsedTime} ms</p>
        </div>
    );
}

export default TimerDisplay;
