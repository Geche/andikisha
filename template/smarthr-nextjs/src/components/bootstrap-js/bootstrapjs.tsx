"use client"

import { useEffect } from "react"

export default function BootstrapJs(){
    useEffect(() => {
        // Use dynamic import for non-blocking load of Bootstrap JS
        import('bootstrap/dist/js/bootstrap.bundle.min.js');
      }, []);
    return null
}