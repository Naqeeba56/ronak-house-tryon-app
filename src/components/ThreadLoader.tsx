"use client";

import Image from "next/image";
import "./ThreadLoader.css";

interface ThreadLoaderProps {
  text?: string;
  detailText?: string;
  fullScreen?: boolean;
}

export default function ThreadLoader({
  text = "Crafting your perfect look",
  detailText = "Stitching every detail together...",
  fullScreen = true,
}: ThreadLoaderProps) {
  return (
    <div
      className={`thread-loader ${fullScreen ? "thread-loader--fullscreen" : "thread-loader--embedded"}`}
      role="status"
      aria-live="polite"
      aria-label={text}
    >
      <div className="thread-loader__scene" aria-hidden="true">
        <div className="thread-loader__glow" />
        <div className="thread-loader__orbit thread-loader__orbit--outer">
          <span className="thread-loader__orbit-dot" />
        </div>
        <div className="thread-loader__orbit thread-loader__orbit--inner" />
        {["one", "two", "three", "four"].map((particle) => (
          <span
            key={particle}
            className={`thread-loader__particle thread-loader__particle--${particle}`}
          />
        ))}
        <div className="thread-loader__logo">
          <Image
            src="/brand/fabricfit-splash-logo.jpg"
            alt=""
            aria-hidden="true"
            fill
            sizes="(max-width: 560px) 55vw, 240px"
            unoptimized
            className="thread-loader__brand-mark"
          />
        </div>
      </div>

      <div className="thread-loader__content">
        <h2>{text}</h2>
        <div className="thread-loader__progress" aria-hidden="true">
          <span />
        </div>
        <p>{detailText}</p>
      </div>
    </div>
  );
}
