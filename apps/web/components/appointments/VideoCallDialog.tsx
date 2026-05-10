"use client"

import { useEffect, useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, PhoneOff, Play } from "lucide-react"

interface VideoCallDialogProps {
  appointmentId: number | null
  isOpen: boolean
  onClose: () => void
  onEndConsultation: () => void
}

export function VideoCallDialog({ appointmentId, isOpen, onClose, onEndConsultation }: VideoCallDialogProps) {
  const jitsiContainerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const apiRef = useRef<any>(null)
  // Post-call confirmation state: "active" = in call, "confirm" = showing continue/stop prompt
  const [callPhase, setCallPhase] = useState<"active" | "confirm">("active")

  useEffect(() => {
    if (isOpen && appointmentId) {
      setCallPhase("active")
      fetchSessionInfo()
    } else {
      setSessionInfo(null)
      setCallPhase("active")
      if (apiRef.current) {
        apiRef.current.dispose()
        apiRef.current = null
      }
    }
  }, [isOpen, appointmentId])

  const fetchSessionInfo = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/video/${appointmentId}/session`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.ok) {
        const data = await res.json()
        setSessionInfo(data)
      }
    } catch (error) {
      console.error("Failed to fetch video session", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (sessionInfo && isOpen && jitsiContainerRef.current && callPhase === "active") {
      const loadJitsiScript = () => {
        return new Promise((resolve) => {
          if ((window as any).JitsiMeetExternalAPI) {
            resolve(true)
            return
          }
          const script = document.createElement("script")
          script.src = `https://${sessionInfo.domain}/external_api.js`
          script.async = true
          script.onload = () => resolve(true)
          document.body.appendChild(script)
        })
      }

      loadJitsiScript().then(() => {
        if (!jitsiContainerRef.current) return

        const domain = sessionInfo.domain
        const options = {
          roomName: sessionInfo.room_name,
          width: "100%",
          height: "100%",
          parentNode: jitsiContainerRef.current,
          jwt: sessionInfo.token,
          userInfo: {
            displayName: sessionInfo.user_name
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
          },
          configOverwrite: {
            disableThirdPartyRequests: true,
            prejoinPageEnabled: false,
            disableDeepLinking: true,
          }
        }
        
        if (apiRef.current) {
          apiRef.current.dispose()
        }
        
        apiRef.current = new (window as any).JitsiMeetExternalAPI(domain, options)
        
        // When the doctor leaves the video call, show the continue/stop prompt
        // instead of immediately closing the dialog
        apiRef.current.addEventListener('videoConferenceLeft', () => {
          setCallPhase("confirm")
        })
      })
    }
    
    return () => {
      if (apiRef.current) {
        apiRef.current.dispose()
        apiRef.current = null
      }
    }
  }, [sessionInfo, isOpen, callPhase])

  const handleContinueConsultation = () => {
    // Re-join the call — reset to active and re-init Jitsi
    setCallPhase("active")
    fetchSessionInfo()
  }

  const handleStopConsultation = () => {
    // Doctor explicitly wants to end — mark as completed and close
    onEndConsultation()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        // If the doctor clicks X or presses Escape, show confirmation instead of closing immediately
        if (callPhase === "active") {
          // Dispose Jitsi first
          if (apiRef.current) {
            apiRef.current.dispose()
            apiRef.current = null
          }
          setCallPhase("confirm")
        } else {
          // Already on confirm screen, just close without marking done
          onClose()
        }
      }
    }}>
      <DialogContent className="max-w-5xl h-[80vh] flex flex-col p-0 overflow-hidden bg-slate-900 border-slate-800">
        <DialogHeader className="p-4 border-b border-slate-800 bg-slate-950">
          <DialogTitle className="text-slate-100 font-bold">Secure Video Consultation</DialogTitle>
        </DialogHeader>
        <div className="flex-1 relative">
          {/* Active call phase */}
          {callPhase === "active" && (
            <>
              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-900 z-10">
                  <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
                  <p className="text-lg animate-pulse">Initializing Secure Room...</p>
                </div>
              )}
              <div ref={jitsiContainerRef} className="w-full h-full" />
            </>
          )}

          {/* Post-call confirmation phase */}
          {callPhase === "confirm" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10">
              <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-2xl border border-slate-700">
                <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <PhoneOff className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Consultation Paused</h3>
                <p className="text-slate-400 mb-8 text-sm leading-relaxed">
                  You have left the video call. Would you like to continue the consultation or end it?
                </p>
                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={handleContinueConsultation} 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base gap-2"
                  >
                    <Play className="w-4 h-4" /> Continue Consultation
                  </Button>
                  <Button 
                    onClick={handleStopConsultation}
                    variant="outline"
                    className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 h-12 text-base gap-2"
                  >
                    <PhoneOff className="w-4 h-4" /> End & Mark as Completed
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
