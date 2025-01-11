"use client";
import React, { useState, useEffect } from "react";

export default function Clock() {
    const [elapsedTime, setElapsedTime] = useState(0);
    const [TimerSetting, setTimerSetting] = useState(1000);
    const [isButtonVisible, setButtonVisible] = useState(false);

    async function fetchTimerData() {
        try {
            const response1 = await fetch("/api/playerState");
            if (!response1.ok) {
                throw new Error("Failed to fetch timer data");
            }
            const data1 = await response1.json();
            setElapsedTime(data1.elapsedTime || 0);

            const response2 = await fetch("/api/timerSetting");
            if (!response2.ok) {
                throw new Error("Failed to fetch timer data");
            }
            const data2 = await response2.json();
            setTimerSetting(data2.timerSetting || 1000);
        } catch (error) {
            console.error("Error fetching timer data:", error);
        }
    }

    useEffect(() => {
        const interval = setInterval(() => {
            fetchTimerData();
        }, 500);
        return () => clearInterval(interval);
    }, []);

    
    useEffect(() => {
            function handleFullscreenChange() {
                const isFullscreen = !!document.fullscreenElement;
                setButtonVisible(isFullscreen);
            }
    
            document.addEventListener("fullscreenchange", handleFullscreenChange);
    
            return () => {
                document.removeEventListener("fullscreenchange", handleFullscreenChange);
            };
        }, []);

    // Calculate progress as a percentage
    const progress = Math.min((elapsedTime / TimerSetting) * 100, 100);

    return (
        <>
        {isButtonVisible && (
        <div  className="flex items-center justify-center min-h-screen">
            <div className="p-4">
                <h1 className="text-xl font-bold">Timer: {elapsedTime}</h1>
                <h2 className="text-lg">Timer Setting: {TimerSetting}</h2>
                {/* Progress Bar with a visible frame */}
                <div className="w-[35vw] h-[17vh] border-[1.5vh] border-[#ED6A40] p-[1.5vh] overflow-hidden">
                    <div
                        className="h-full bg-[#ED6A40] transition-all duration-100"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>
        </div>
        )}
        </>
    );
    
}
