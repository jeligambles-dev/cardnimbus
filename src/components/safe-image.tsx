"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

const FALLBACK = "/card-default.jpg";

interface SafeImageProps extends Omit<ImageProps, "src" | "onError"> {
  src: string | null | undefined;
}

export function SafeImage({ src, alt, ...props }: SafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src || FALLBACK);

  return (
    <Image
      src={currentSrc}
      alt={alt}
      onError={() => setCurrentSrc(FALLBACK)}
      {...props}
    />
  );
}
