"use client";
import React, { useState, useEffect, use } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { redirect } from "next/navigation";

function Fullscreen() {
    const [isButtonVisible, setButtonVisible] = useState(true);
    const [isPlayerInGame, setPlayerInGame] = useState(false);

    const { data: session } = useSession();
    console.log("session is: ", session);


    function postIsPlayerInGame() {
        fetch("/api/playerState", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ isPlayerInGame }),
        })
    }

    // Handle fullscreen changes
    useEffect(() => {
        function handleFullscreenChange() {
            const isFullscreen = !!document.fullscreenElement;
            setButtonVisible(!isFullscreen);
            setPlayerInGame(isFullscreen);
            if (!isFullscreen) {
                redirect("/");
            }
        }

        document.addEventListener("fullscreenchange", handleFullscreenChange);

        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
    }, []);

    // Detect tab visibility
    useEffect(() => {
        function handleVisibilityChange() {
            if (document.hidden) {
                console.log("User switched tabs or minimized the browser");
                setPlayerInGame(false);
                redirect("/");
            }
        }

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    // Detect browser close or refresh
    useEffect(() => {
        function handleBeforeUnload() {
            setPlayerInGame(false);
            redirect("/");
        }

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);

    useEffect(() => {
        // Every time isPlayerInGame changes, POST the new value
        postIsPlayerInGame();
      }, [isPlayerInGame]);
      
        

    return (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            {isButtonVisible && (
                <button
                    onClick={() => document.documentElement.requestFullscreen()}
                    className="text-[#ED6A40] text-[15vh] hover:scale-150  transition"
                >
                    SET TIMER
                </button>
            )}
        </div>
    );
}

export default Fullscreen;
