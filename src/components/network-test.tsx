import React, { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Loader2, Wifi, AlertTriangle } from "lucide-react";
import { getEnvVar } from "../utils/env";

export function NetworkTest() {
  const [isTestingDirect, setIsTestingDirect] = useState(false);
  const [directResult, setDirectResult] = useState<any>(null);

  const testDirectFetch = async () => {
    setIsTestingDirect(true);
    setDirectResult(null);

    try {
      // Get environment variables
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

      const API_BASE_URL = getEnvVar(
        "VITE_API_BASE_URL",
        "https://api.gifthuette.de"
      );
      const SERVER_TOKEN = getEnvVar("VITE_GIFTHUETTE_SERVER_TOKEN", "");

      console.log("Direct fetch test:", {
        API_BASE_URL,
        HAS_TOKEN: !!SERVER_TOKEN,
        TOKEN_START: SERVER_TOKEN
          ? SERVER_TOKEN.substring(0, 25) + "..."
          : "none",
      });

      // Test 1: Health check without auth
      const pingResponse = await fetch(`${API_BASE_URL}/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Health Response:", {
        status: pingResponse.status,
        statusText: pingResponse.statusText,
        ok: pingResponse.ok,
      });

      if (!pingResponse.ok) {
        throw new Error(
          `Ping failed: ${pingResponse.status} ${pingResponse.statusText}`
        );
      }

      let pingData;
      try {
        pingData = await pingResponse.json();
      } catch {
        pingData = { message: "Response was not JSON" };
      }

      // Test 2: Categories with auth
      const categoriesResponse = await fetch(`${API_BASE_URL}/categories`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SERVER_TOKEN}`,
        },
      });

      console.log("Categories Response:", {
        status: categoriesResponse.status,
        statusText: categoriesResponse.statusText,
        ok: categoriesResponse.ok,
      });

      let categoriesData;
      try {
        if (categoriesResponse.ok) {
          categoriesData = await categoriesResponse.json();
        } else {
          categoriesData = {
            error: `${categoriesResponse.status}: ${categoriesResponse.statusText}`,
          };
        }
      } catch {
        categoriesData = { error: "Response was not JSON" };
      }

      setDirectResult({
        success: true,
        ping: {
          status: pingResponse.status,
          data: pingData,
        },
        categories: {
          status: categoriesResponse.status,
          data: categoriesData,
        },
        config: {
          API_BASE_URL,
          HAS_TOKEN: !!JWT_TOKEN,
        },
      });
    } catch (error: any) {
      console.error("Direct fetch error:", error);
      setDirectResult({
        success: false,
        error: error.message,
        stack: error.stack,
      });
    } finally {
      setIsTestingDirect(false);
    }
  };

  return (
    <Card className="mystical-card wood-texture border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="h-5 w-5 text-primary" />
          Direct Network Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={testDirectFetch}
          disabled={isTestingDirect}
          className="mystical-glow w-full"
        >
          {isTestingDirect ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Testing Network...
            </>
          ) : (
            <>
              <Wifi className="h-4 w-4 mr-2" />
              Run Direct Fetch Test
            </>
          )}
        </Button>

        {directResult && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={directResult.success ? "default" : "destructive"}>
                {directResult.success ? "Success" : "Failed"}
              </Badge>
            </div>

            {directResult.success ? (
              <div className="space-y-2 text-xs">
                <div className="bg-secondary/20 p-2 rounded">
                  <div className="font-medium mb-1">Configuration:</div>
                  <div>API URL: {directResult.config.API_BASE_URL}</div>
                  <div>
                    Has Token: {directResult.config.HAS_TOKEN ? "Yes" : "No"}
                  </div>
                </div>

                <div className="bg-secondary/20 p-2 rounded">
                  <div className="font-medium mb-1">Ping Test:</div>
                  <div>Status: {directResult.ping.status}</div>
                  <div>
                    Response: {JSON.stringify(directResult.ping.data, null, 2)}
                  </div>
                </div>

                <div className="bg-secondary/20 p-2 rounded">
                  <div className="font-medium mb-1">Categories Test:</div>
                  <div>Status: {directResult.categories.status}</div>
                  <div className="max-h-32 overflow-y-auto">
                    Response:{" "}
                    {JSON.stringify(directResult.categories.data, null, 2)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-900/20 p-2 rounded text-xs">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <span className="font-medium text-red-400">
                    Error Details:
                  </span>
                </div>
                <div className="space-y-1">
                  <div>Message: {directResult.error}</div>
                  {directResult.stack && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-red-400">
                        Stack Trace
                      </summary>
                      <pre className="mt-1 text-xs overflow-x-auto whitespace-pre-wrap">
                        {directResult.stack}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
