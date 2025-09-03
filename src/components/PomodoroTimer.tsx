"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Coffee, BookOpen } from "lucide-react";

interface PomodoroTimerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSessionComplete: () => void;
  workMinutes?: number;
  breakMinutes?: number;
}

export function PomodoroTimer({
  isOpen,
  onOpenChange,
  onSessionComplete,
  workMinutes = 25,
  breakMinutes = 5,
}: PomodoroTimerProps) {
  const [sessionType, setSessionType] = useState<'work' | 'break'>('work');
  const [minutes, setMinutes] = useState(workMinutes);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  const resetTimer = useCallback(() => {
    setIsActive(false);
    if (sessionType === 'work') {
      setMinutes(workMinutes);
    } else {
      setMinutes(breakMinutes);
    }
    setSeconds(0);
  }, [sessionType, workMinutes, breakMinutes]);
  
  useEffect(() => {
    resetTimer();
  }, [sessionType, workMinutes, breakMinutes, resetTimer]);
  
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          if (sessionType === 'work') {
            onSessionComplete();
            setSessionType('break');
          } else {
            setSessionType('work');
          }
          setIsActive(false);
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, minutes, seconds, sessionType, onSessionComplete, workMinutes, breakMinutes]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const totalSeconds = (sessionType === 'work' ? workMinutes : breakMinutes) * 60;
  const elapsedSeconds = totalSeconds - (minutes * 60 + seconds);
  const progress = (elapsedSeconds / totalSeconds) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center text-2xl font-headline">
            {sessionType === 'work' ? (
              <>
                <BookOpen className="mr-2 h-6 w-6" /> Focus Session
              </>
            ) : (
              <>
                <Coffee className="mr-2 h-6 w-6" /> Break Time
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-center">
            {sessionType === 'work' ? "Time to focus on your task." : "Time for a short break to recharge."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center my-8">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                className="text-muted"
                strokeWidth="7"
                stroke="currentColor"
                fill="transparent"
                r="45"
                cx="50"
                cy="50"
              />
              <circle
                className="text-primary"
                strokeWidth="7"
                strokeDasharray={`${(progress * 283) / 100}, 283`}
                strokeDashoffset="0"
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="45"
                cx="50"
                cy="50"
                style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl font-mono font-bold tracking-tighter">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-center gap-2">
          <Button onClick={toggleTimer} size="lg" className="px-8">
            {isActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            <span className="sr-only">{isActive ? 'Pause' : 'Play'}</span>
          </Button>
          <Button onClick={resetTimer} variant="outline" size="lg">
            <RotateCcw className="h-5 w-5" />
            <span className="sr-only">Reset</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
