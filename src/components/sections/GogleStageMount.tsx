"use client";

import dynamic from "next/dynamic";
import { useLoading } from "@/components/providers/LoadingProvider";

// three.js + postprocessing are heavy: load the 3D stage only in the browser, and only once the
// preloader is done, so shader compilation never competes with first paint or the intro animation.
const GogleStage = dynamic(() => import("./GogleStage"), { ssr: false });

export default function GogleStageMount() {
  const { isLoading } = useLoading();
  return isLoading ? null : <GogleStage />;
}
