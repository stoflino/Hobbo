"use client";

import Image from "next/image";
import { useState } from "react";

export function PlayerCharacter() {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="mx-auto shrink-0 sm:mx-0">
      <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-xl border-2 border-street-border bg-street-bg sm:h-44 sm:w-44">
        {imageError ? (
          <span className="text-6xl" aria-hidden>
            🧍
          </span>
        ) : (
          <Image
            src="/homeless.png"
            alt="Postava bezdomovce"
            width={176}
            height={176}
            className="h-full w-full object-contain"
            priority
            onError={() => setImageError(true)}
          />
        )}
      </div>
    </div>
  );
}
