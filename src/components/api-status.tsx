import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { CheckCircle, XCircle, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { api } from "../services/api";
import { getEnvVar } from "../utils/env";

interface ApiStatusProps {
  className?: string;
}

export function ApiStatus({ className }: ApiStatusProps) {
  const [status, setStatus] = useState<{
    isOnline: boolean;
    hasToken: boolean;
    apiReachable: boolean;
    lastChecked: Date;
  }>({
    isOnline: navigator.onLine,
    hasToken: false,
    apiReachable: false,
    lastChecked: new Date(),
  });

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        // Check if we have a token
        const getEnvVar = (key: string, defaultValue: string = "") => {
          try {
            if (typeof import.meta !== "undefined" && import.meta.env) {
              return import.meta.env[key] || defaultValue;
            }
            return defaultValue;
          } catch {
            return defaultValue;
          }
        };

        const SERVER_TOKEN = getEnvVar("VITE_GIFTHUETTE_SERVER_TOKEN", "");
        const API_BASE_URL = getEnvVar(
          "VITE_API_BASE_URL",
          "https://api.gifthuette.de"
        );

        const hasToken = !!SERVER_TOKEN;

        // Try to reach the API
        let apiReachable = false;
        try {
          // Use the new API health check
          await api.healthCheck();
          apiReachable = true;
        } catch (error) {
          console.warn("API not reachable:", error);
          apiReachable = false;
        }

        setStatus({
          isOnline: navigator.onLine,
          hasToken,
          apiReachable,
          lastChecked: new Date(),
        });
      } catch (error) {
        console.error("Error checking API status:", error);
      }
    };

    checkApiStatus();

    // Check every 30 seconds
    const interval = setInterval(checkApiStatus, 30000);

    // Listen for online/offline events
    const handleOnline = () =>
      setStatus((prev) => ({ ...prev, isOnline: true }));
    const handleOffline = () =>
      setStatus((prev) => ({ ...prev, isOnline: false }));

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const getStatusIcon = (isOk: boolean) => {
    return isOk ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (isOk: boolean, label: string) => {
    return (
      <Badge
        variant={isOk ? "default" : "destructive"}
        className="flex items-center gap-1"
      >
        {getStatusIcon(isOk)}
        {label}
      </Badge>
    );
  };

  return (
    <Card
      className={`${className} mystical-card wood-texture border-primary/30`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          {status.isOnline ? (
            <Wifi className="h-4 w-4 text-primary" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" />
          )}
          API Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span>Internet:</span>
          {getStatusBadge(
            status.isOnline,
            status.isOnline ? "Online" : "Offline"
          )}
        </div>

        <div className="flex items-center justify-between text-xs">
          <span>Server Token:</span>
          {getStatusBadge(
            status.hasToken,
            status.hasToken ? "Vorhanden" : "Fehlt"
          )}
        </div>

        <div className="flex items-center justify-between text-xs">
          <span>API Erreichbar:</span>
          {getStatusBadge(
            status.apiReachable,
            status.apiReachable ? "Ja" : "Nein"
          )}
        </div>

        <div className="text-xs text-muted-foreground pt-2 border-t border-primary/20">
          Letzte Prüfung: {status.lastChecked.toLocaleTimeString("de-DE")}
        </div>

        {getEnvVar("VITE_DEBUG") === "true" && (
          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-primary/20">
            <div>API URL: {API_BASE_URL}</div>
            <div>
              Server Token:{" "}
              {getEnvVar("VITE_GIFTHUETTE_SERVER_TOKEN", "")
                ? "✓ Gesetzt"
                : "✗ Nicht gesetzt"}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
