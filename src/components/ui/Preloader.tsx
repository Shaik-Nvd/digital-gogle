"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { PillToggle } from "@/components/ui/PillToggle";

export default function Preloader() {
  const [step, setStep] = useState<"init" | "terminal" | "flash" | "converge">("init");
  const [loading, setLoading] = useState(true);
  const [isSoundOn, setIsSoundOn] = useState(true);

  const handleStart = () => {
    setStep("terminal");
    
    if (isSoundOn) {
      try {
        const audio = new Audio('/SoundAnimation.mp3');
        audio.play().catch((e) => console.error("Audio play failed:", e));
      } catch (e) {}
    }

    // Timeline matches the video pacing
    setTimeout(() => setStep("flash"), 2500); 
    setTimeout(() => setStep("converge"), 2800); 
    setTimeout(() => setLoading(false), 4500); 
  };

  const scatterItems = [
    { id: 1, initial: { x: "-40vw", y: "-30vh", rotate: -15 } },
    { id: 2, initial: { x: "30vw", y: "-40vh", rotate: 10 } },
    { id: 3, initial: { x: "-35vw", y: "30vh", rotate: 20 } },
    { id: 4, initial: { x: "40vw", y: "25vh", rotate: -10 } },
    { id: 5, initial: { x: "0vw", y: "-45vh", rotate: -5 } },
    { id: 6, initial: { x: "0vw", y: "45vh", rotate: 5 } },
  ];

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050505] overflow-hidden"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Immersive 3D Grid Perspective */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-15 bg-center [transform:rotateX(60deg)_scale(2.5)] origin-bottom" style={{ perspective: "1000px" }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black" />

          {/* Top Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="absolute top-6 left-6 right-6 md:top-8 md:left-8 md:right-8 flex items-start justify-between z-20 gap-4"
          >
            {/* Branding */}
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="w-8 h-8 shrink-0 rounded-sm bg-accent/10 flex items-center justify-center border border-accent/50 shadow-[0_0_15px_rgba(196,240,66,0.2)]">
                <span className="text-accent font-bold text-xs">DG</span>
              </div>
              <div className="font-mono text-accent text-[9px] md:text-xs tracking-[0.1em] md:tracking-[0.2em] uppercase opacity-80 leading-relaxed">
                DIGITAL GOGLE STUDIO <span className="hidden md:inline">// AUTO BUILD</span>
              </div>
            </div>

            {/* Sound Toggle */}
            <PillToggle
              options={[
                { value: "on", icon: <Volume2 size={16} /> },
                { value: "off", icon: <VolumeX size={16} /> }
              ]}
              value={isSoundOn ? "on" : "off"}
              onChange={(val) => setIsSoundOn(val === "on")}
            />
          </motion.div>

          {/* Center Terminal Window */}
          {(step === "init" || step === "terminal") && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative z-10 w-[92%] max-w-5xl aspect-square md:aspect-video max-h-[70vh] border border-accent/20 rounded-xl bg-black/40 backdrop-blur-2xl flex flex-col overflow-hidden shadow-[0_0_80px_rgba(196,240,66,0.05)] ring-1 ring-white/5"
            >
              {/* Terminal Header */}
              <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-accent/10 bg-black/60">
                <div className="flex space-x-2">
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-accent/30 shadow-[0_0_10px_rgba(196,240,66,0.2)]" />
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-accent/30 shadow-[0_0_10px_rgba(196,240,66,0.2)]" />
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-accent/30 shadow-[0_0_10px_rgba(196,240,66,0.2)]" />
                </div>
                <div className="font-mono text-[9px] md:text-xs text-muted/60 tracking-wider">naveed@digitalgogle:~/production</div>
                <div className={`font-mono text-[10px] md:text-xs tracking-widest hidden md:block opacity-70 ${isSoundOn ? 'text-accent' : 'text-muted'}`}>AUDIO //{isSoundOn ? 'ON' : 'OFF'}</div>
              </div>
              
              {/* Terminal Body */}
              <div className="p-4 md:p-8 font-mono text-[10px] md:text-sm text-accent flex-1 relative overflow-hidden leading-relaxed">
                <AnimatePresence>
                  {step === "terminal" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-1 md:space-y-2 opacity-90 drop-shadow-[0_0_8px_rgba(196,240,66,0.5)]"
                    >
                      <p>$ naveed build --production</p>
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        transition={{ duration: 1.8, ease: "linear" }}
                        className="overflow-hidden space-y-1 md:space-y-2 text-accent/80 mt-2"
                      >
                        <p>import {'{'} design, code, motion {'}'} from '@naveed/studio';</p>
                        <p className="hidden md:block">const projects = await Portfolio.mount(['UrlScan', 'Fhoneify', 'Alloy Hub']);</p>
                        <br className="hidden md:block"/>
                        <p>const experience = new Engine( responsive:true, theme:'dark' );</p>
                        <p>await experience.compile({'{'} html:true, css:true, javascript:true {'}'});</p>
                        <p className="mt-2 md:mt-4 text-accent">deploy('digitalgogle.com'); // BUILD READY</p>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Progress Bar (Always visible but fills on compile) */}
                <div className="absolute bottom-6 left-6 right-6 flex items-center space-x-4">
                  <span className={`w-2 h-2 rounded-full bg-accent ${step === "terminal" ? 'animate-pulse' : 'opacity-50'}`} />
                  <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-accent/80">
                    {step === "terminal" ? "COMPILING EXPERIENCE" : "SYSTEM IDLE"}
                  </span>
                  <div className="flex-1 h-px bg-accent/10 relative overflow-hidden">
                    <motion.div 
                      className="absolute top-0 left-0 h-full bg-accent shadow-[0_0_10px_rgba(196,240,66,1)]"
                      initial={{ width: "0%" }}
                      animate={{ width: step === "terminal" ? "100%" : "0%" }}
                      transition={{ duration: 2.2, ease: "easeInOut" }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Bottom CTA (Init Step) */}
          <AnimatePresence>
            {step === "init" && (
              <motion.div
                className="absolute bottom-12 md:bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-pointer group z-20"
                onClick={handleStart}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <button className="px-5 py-2.5 md:px-6 md:py-3 bg-accent text-black rounded-full font-bold flex items-center space-x-3 hover:scale-105 transition-transform shadow-[0_0_30px_rgba(196,240,66,0.3)]">
                  <div className="w-5 h-5 md:w-6 md:h-6 bg-black rounded-full flex items-center justify-center pl-0.5">
                    <div className="w-0 h-0 border-t-[4px] border-b-[4px] border-l-[6px] border-t-transparent border-b-transparent border-l-accent" />
                  </div>
                  <span className="tracking-widest text-[10px] md:text-xs">WATCH TEASER // SOUND {isSoundOn ? 'ON' : 'OFF'}</span>
                </button>
                <div className="mt-4 md:mt-6 text-[9px] md:text-[10px] font-mono text-muted/50 group-hover:text-muted transition-colors tracking-[0.3em] uppercase">
                  TOUCH / TAP ANYWHERE TO COMPILE
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Extreme Immersive Flash Sequence */}
          <AnimatePresence>
            {step === "flash" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, filter: "brightness(1) contrast(1)" }}
                animate={{ 
                  opacity: [0, 1, 1], 
                  scale: [0.95, 1.05, 1],
                  filter: ["brightness(1) contrast(1)", "brightness(2) contrast(1.5)", "brightness(1) contrast(1)"]
                }}
                exit={{ opacity: 0, scale: 1.5, filter: "blur(20px)" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute inset-0 z-[200] bg-white flex items-center justify-center overflow-hidden"
              >
                {/* Chromatic Aberration Left (Red) */}
                <motion.div
                  initial={{ scale: 0, opacity: 0, letterSpacing: "-0.5em" }}
                  animate={{ 
                    scale: [0, 1.2, 1],
                    opacity: [0, 1, 0],
                    letterSpacing: ["-0.5em", "0.2em", "0.5em"],
                    x: [-20, 20, 0]
                  }}
                  transition={{ duration: 0.4 }}
                  className="absolute text-8xl md:text-[15rem] font-black text-red-500 mix-blend-multiply"
                >
                  SHIP.
                </motion.div>
                
                {/* Chromatic Aberration Right (Blue) */}
                <motion.div
                  initial={{ scale: 0, opacity: 0, letterSpacing: "-0.5em" }}
                  animate={{ 
                    scale: [0, 1.2, 1],
                    opacity: [0, 1, 0],
                    letterSpacing: ["-0.5em", "0.2em", "0.5em"],
                    x: [20, -20, 0]
                  }}
                  transition={{ duration: 0.4 }}
                  className="absolute text-8xl md:text-[15rem] font-black text-blue-500 mix-blend-multiply"
                >
                  SHIP.
                </motion.div>

                {/* Core Text Shockwave */}
                <motion.div
                  initial={{ scale: 0, opacity: 0, letterSpacing: "-0.5em", y: 50 }}
                  animate={{ 
                    scale: [0, 1.3, 1],
                    opacity: [0, 1, 1],
                    letterSpacing: ["-0.5em", "0em", "0.05em"],
                    y: [50, -10, 0]
                  }}
                  transition={{ duration: 0.3, ease: "circOut" }}
                  className="relative z-10 text-8xl md:text-[15rem] font-black text-black"
                >
                  SHIP.
                </motion.div>
                
                {/* Energy Flash Overlay */}
                <motion.div 
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 bg-accent mix-blend-overlay"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Converge Sequence */}
          {step === "converge" && (
            <div className="relative w-full h-full flex items-center justify-center z-40">
              {scatterItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ ...item.initial, scale: 1, opacity: 0 }}
                  animate={{
                    x: 0,
                    y: 0,
                    rotate: 0,
                    scale: 0.2,
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{
                    duration: 1.2,
                    ease: [0.22, 1, 0.36, 1],
                    delay: index * 0.05,
                  }}
                  className="absolute w-[300px] h-[200px] bg-[#0a0a0a] border border-glass-border rounded-xl shadow-2xl flex flex-col p-4 overflow-hidden"
                >
                  <div className="w-full h-1/2 bg-white/5 rounded-lg mb-4" />
                  <div className="w-3/4 h-3 bg-white/10 rounded mb-2" />
                  <div className="w-1/2 h-3 bg-white/10 rounded" />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
