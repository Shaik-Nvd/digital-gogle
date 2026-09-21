"use client";

import { useEffect, useRef } from "react";

const BARS = 28;

/** Live microphone level bars. Updates the DOM directly so it never re-renders the chat. */
export default function VoiceMeter({ analyser }: { analyser: AnalyserNode | null }) {
  const bars = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    if (!analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    let frame = 0;
    const draw = () => {
      analyser.getByteFrequencyData(data);
      // Voice energy sits in the lower half of the spectrum.
      const usable = Math.floor(data.length / 2);
      bars.current.forEach((bar, index) => {
        if (!bar) return;
        const level = data[Math.floor((index / BARS) * usable)] / 255;
        bar.style.transform = `scaleY(${0.12 + level * 0.88})`;
      });
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, [analyser]);

  return (
    <div aria-hidden className="flex h-8 items-center justify-center gap-[3px]">
      {Array.from({ length: BARS }, (_, index) => (
        <span
          key={index}
          ref={(element) => { bars.current[index] = element; }}
          className="h-full w-[3px] origin-center rounded-full bg-accent"
          style={{ transform: "scaleY(0.12)" }}
        />
      ))}
    </div>
  );
}
