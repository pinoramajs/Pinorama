import { useAppConfig } from "@/contexts"
import { useEffect, useState } from "react"
import { usePinoramaIntrospection } from "./use-pinorama-introspection"
import { usePinoramaStyles } from "./use-pinorama-styles"

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "failed"
  | "unknown"

export const ConnectionStatus = Object.freeze({
  Disconnected: "disconnected",
  Connecting: "connecting",
  Connected: "connected",
  Failed: "failed",
  Unknown: "unknown"
}) satisfies Readonly<Record<Capitalize<ConnectionStatus>, ConnectionStatus>>

type ConnectionStatusDetail = {
  connectionStatus: ConnectionStatus
  isConnected?: boolean
}

export function usePinoramaConnection() {
  const appConfig = useAppConfig()

  const introspection = usePinoramaIntrospection()
  usePinoramaStyles()

  const [{ connectionStatus, isConnected = false }, setConnectionStatus] =
    useState<ConnectionStatusDetail>({
      connectionStatus: ConnectionStatus.Unknown
    })

  useEffect(() => {
    switch (true) {
      case appConfig?.config.connectionIntent === false:
        setConnectionStatus({ connectionStatus: ConnectionStatus.Disconnected })
        break
      case introspection.status === "pending" &&
        introspection.fetchStatus === "fetching":
        setConnectionStatus({ connectionStatus: ConnectionStatus.Connecting })
        break
      case introspection.status === "success":
        setConnectionStatus({
          connectionStatus: ConnectionStatus.Connected,
          isConnected: true
        })
        break
      case introspection.status === "error":
        setConnectionStatus({ connectionStatus: ConnectionStatus.Failed })
        break
      default:
        setConnectionStatus({ connectionStatus: ConnectionStatus.Unknown })
        break
    }
  }, [
    appConfig?.config.connectionIntent,
    introspection.status,
    introspection.fetchStatus
  ])

  const toggleConnection = () => {
    appConfig?.setConfig({
      ...appConfig.config,
      connectionIntent: !appConfig.config.connectionIntent
    })
  }

  return {
    connectionStatus,
    toggleConnection,
    isConnected,
    introspection: introspection.data
  }
}
