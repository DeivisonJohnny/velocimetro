"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"

export default function Speedometer() {
  const [speed, setSpeed] = useState(0)
  const [maxSpeed, setMaxSpeed] = useState(0)
  const [isTracking, setIsTracking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [distance, setDistance] = useState(0)
  const watchIdRef = useRef<number | null>(null)
  const lastPositionRef = useRef<GeolocationPosition | null>(null)

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Raio da Terra em km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  useEffect(() => {
    if (!isTracking) return

    if (!navigator.geolocation) {
      setError("Geolocalização não suportada pelo navegador")
      return
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setError(null)

        // Velocidade em m/s, convertendo para km/h
        const speedInKmh = position.coords.speed ? Math.round(position.coords.speed * 3.6) : 0

        setSpeed(Math.max(0, speedInKmh))

        if (speedInKmh > maxSpeed) {
          setMaxSpeed(speedInKmh)
        }

        // Calcular distância percorrida
        if (lastPositionRef.current) {
          const dist = calculateDistance(
            lastPositionRef.current.coords.latitude,
            lastPositionRef.current.coords.longitude,
            position.coords.latitude,
            position.coords.longitude,
          )
          setDistance((prev) => prev + dist)
        }
        lastPositionRef.current = position
      },
      (err) => {
        setError("Erro ao obter localização. Verifique as permissões.")
        console.error(err)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      },
    )

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [isTracking, maxSpeed])

  const toggleTracking = async () => {
    if (!isTracking) {
      // Para Safari/iOS, solicitar permissão explicitamente antes de iniciar
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
          if (permissionStatus.state === 'denied') {
            setError('Permissão de localização negada. Ative nas configurações do navegador.')
            return
          }
        } catch (e) {
          // Safari pode não suportar permissions.query para geolocation
          console.log('Permissions API não disponível, continuando...')
        }
      }

      // Fazer uma solicitação de teste primeiro para garantir permissão
      try {
        await new Promise<void>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            () => resolve(),
            (err) => reject(err),
            {
              enableHighAccuracy: true,
              maximumAge: 0,
              timeout: 10000,
            }
          )
        })
      } catch (err) {
        setError('Não foi possível obter permissão de localização. Verifique as configurações.')
        return
      }
    }

    setIsTracking(!isTracking)
    if (isTracking) {
      setSpeed(0)
      lastPositionRef.current = null
    }
  }

  const resetStats = () => {
    setMaxSpeed(0)
    setDistance(0)
    setSpeed(0)
    lastPositionRef.current = null
  }

  const speedPercentage = Math.min((speed / 200) * 100, 100)

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md border-border bg-card p-8">
        <div className="flex flex-col items-center gap-8">
          {/* Velocímetro circular */}
          <div className="relative">
            <svg className="h-64 w-64 -rotate-90" viewBox="0 0 200 200">
              {/* Background circle */}
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                className="text-muted"
              />
              {/* Progress circle */}
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${534 * (speedPercentage / 100)} 534`}
                className="text-primary transition-all duration-300"
              />
            </svg>

            {/* Velocidade no centro */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-7xl font-bold tabular-nums tracking-tight text-foreground">{speed}</div>
              <div className="text-lg font-medium text-muted-foreground">km/h</div>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid w-full grid-cols-2 gap-4">
            <div className="rounded-lg bg-secondary p-4 text-center">
              <div className="text-sm font-medium text-secondary-foreground/70">Máxima</div>
              <div className="text-3xl font-bold tabular-nums text-secondary-foreground">{maxSpeed}</div>
              <div className="text-xs text-secondary-foreground/50">km/h</div>
            </div>
            <div className="rounded-lg bg-secondary p-4 text-center">
              <div className="text-sm font-medium text-secondary-foreground/70">Distância</div>
              <div className="text-3xl font-bold tabular-nums text-secondary-foreground">{distance.toFixed(2)}</div>
              <div className="text-xs text-secondary-foreground/50">km</div>
            </div>
          </div>

          {/* Mensagem de erro */}
          {error && (
            <div className="w-full rounded-lg bg-destructive/10 p-3 text-center text-sm text-destructive">{error}</div>
          )}

          {/* Botões de controle */}
          <div className="flex w-full gap-3">
            <button
              onClick={toggleTracking}
              className={`flex-1 rounded-lg px-6 py-4 font-semibold transition-colors ${
                isTracking
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              {isTracking ? "Parar" : "Iniciar"}
            </button>
            <button
              onClick={resetStats}
              disabled={isTracking}
              className="rounded-lg bg-secondary px-6 py-4 font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Resetar
            </button>
          </div>

          {/* Dica */}
          {!isTracking && (
            <p className="text-center text-sm text-muted-foreground leading-relaxed">
              Pressione Iniciar para começar a medir sua velocidade. Use ao ar livre para melhor precisão do GPS.
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
