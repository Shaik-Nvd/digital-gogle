"use client";

import dynamic from "next/dynamic";

// three.js + postprocessing are heavy: load the 3D stage only in the browser, after first paint.
const GogleStage = dynamic(() => import("./GogleStage"), { ssr: false });

export default function GogleStageMount() {
  return <GogleStage />;
}
