"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import {usePathname} from "next/navigation";
import {useEffect, useState} from "react";
export let STORAGE_MOVIES_DONE: any  = null

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const pathname = usePathname();
  const  [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log(pathname)
    if (pathname === "/p2p") {
      STORAGE_MOVIES_DONE = "movies_p2p"
    } else {
      STORAGE_MOVIES_DONE = "movies_1"
    }
    setLoading(false)
  }, [])
   if (!loading) return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}