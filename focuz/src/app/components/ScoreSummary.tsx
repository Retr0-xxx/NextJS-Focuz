"use client";
import { useEffect, useState } from "react";

// Utility function to format milliseconds into days, hours, minutes, seconds
function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Create an array of time units, conditionally including non-zero values
    const timeParts = [];
    if (days > 0) timeParts.push(`${days}d`);
    if (hours > 0) timeParts.push(`${hours}h`);
    if (minutes > 0) timeParts.push(`${minutes}m`);
    if (seconds > 0) timeParts.push(`${seconds}s`);

    // Join the time parts with a space and return
    return timeParts.join(" ");
}

export default function ScoreSummary() {
    const [lastTime, setLastTime] = useState(null);
    const [totalTime, setTotalTime] = useState(null);

    useEffect(() => {
        async function readPlayerInfo() {
            try {
                const response = await fetch("/api/playerInfo");
                const data = await response.json();
                // Extract and set last_time and total_time
                setLastTime(data.last_time);
                setTotalTime(data.total_time);
            } catch (error) {
                console.error("Error fetching player info:", error);
            }
        }
        readPlayerInfo();
    }, []);

    return (
        <div className="flex flex-col items-start justify-start pl-[7vw] pt-[3vh]">
            <h1 className="text-[#FCB7AB] text-[7vh] leading-[7vh]">
                You Have Focused For
            </h1>
            <p className="text-[#FCB7AB] text-[35vh] leading-[35vh] font-bold">
                {totalTime !== null ? formatTime(totalTime) : "Loading..."}
            </p>
            <h1 className="text-[#FCB7AB] text-[5vh] leading-[5vh]">
                Last Focus
            </h1>
            <p className="text-[#FCB7AB] text-[15vh] leading-[15vh] font-bold">
                {lastTime !== null ? formatTime(lastTime) : "Loading..."}
            </p>
        </div>
    );
}
