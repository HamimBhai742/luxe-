/* eslint-disable @typescript-eslint/no-explicit-any */

let googleInitPromise: Promise<any> | null = null;

export const loadGoogleGIS = (): Promise<any> => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Cannot load Google GIS on server."));
  }
  
  if ((window as any).google?.accounts?.oauth2) {
    return Promise.resolve((window as any).google);
  }
  
  if (googleInitPromise) {
    return googleInitPromise;
  }

  googleInitPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if ((window as any).google?.accounts?.oauth2) {
        resolve((window as any).google);
      } else {
        reject(new Error("Google GIS library was loaded but is not fully initialized."));
      }
    };
    script.onerror = () => {
      reject(new Error("Failed to load Google GIS script."));
    };
    document.body.appendChild(script);
  });

  return googleInitPromise;
};
