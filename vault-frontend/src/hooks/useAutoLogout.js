/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from "react";

const EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
];

export default function useAutoLogout(logoutUser) {

  const timer = useRef();

  const resetTimer = () => {

    clearTimeout(timer.current);

    timer.current = setTimeout(() => {

      logoutUser();

    }, 5 * 60 * 1000); // 5 mins
  };

  useEffect(() => {

    EVENTS.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {

      clearTimeout(timer.current);

      EVENTS.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };

  }, []);
}