import { useState, useCallback, useEffect } from "react";
import { 
  LiveKitRoom, 
  RoomAudioRenderer, 
  useRoomContext 
} from "@livekit/components-react";
import "@livekit/components-styles";
import AvatarVoiceAgent from "./AvatarVoiceAgent";
import "./LiveKitWidget.css";

// --- NEW COMPONENT: This listens for the Python Agent's "open_url" command ---
const NavigationHandler = () => {
  const room = useRoomContext();

  useEffect(() => {
    if (!room) return;

    // This function runs every time the Python agent sends a data message
    const handleData = (payload) => {
      try {
        const decoder = new TextDecoder();
        const message = JSON.parse(decoder.decode(payload));

        if (message.type === "OPEN_URL") {
          console.log("Agent is navigating to:", message.url);
          // This moves the user to the new page
          window.location.href = message.url; 
        }
      } catch (err) {
        console.error("Error decoding agent message:", err);
      }
    };

    room.on("dataReceived", handleData);
    return () => room.off("dataReceived", handleData);
  }, [room]);

  return null; // This component stays invisible
};

// --- MAIN WIDGET COMPONENT ---
const LiveKitWidget = ({ setShowSupport }) => {
  const [token, setToken] = useState(null);
  const [lkUrl, setLkUrl] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);

  const getToken = useCallback(async () => {
    try {
      console.log("Fetching token and URL from backend...");
      const response = await fetch(
        `/api/getToken?name=${encodeURIComponent("admin")}`
      );
      
      const data = await response.json();
      
      if (data.token && data.url) {
        setToken(data.token);
        setLkUrl(data.url); 
        setIsConnecting(false);
      } else {
        console.error("Invalid response format from API:", data);
        setIsConnecting(false);
      }
    } catch (error) {
      console.error("Connection error:", error);
      setIsConnecting(false);
    }
  }, []);

  useEffect(() => {
    getToken();
  }, [getToken]);

  return (
    <div className="modal-content">
      <div className="support-room">
        {isConnecting ? (
          <div className="connecting-status">
            <h2>Calling the Concierge...</h2>
            <div className="loading-spinner"></div>
            <button
              type="button"
              className="cancel-button"
              onClick={() => setShowSupport(false)}
            >
              Cancel
            </button>
          </div>
        ) : token && lkUrl ? (
          <LiveKitRoom
            serverUrl={lkUrl}
            token={token}
            connect={true}
            video={false}
            audio={true}
            onDisconnected={() => {
              setShowSupport(false);
              setIsConnecting(true);
            }}
          >
            <RoomAudioRenderer />
            
            {/* The NavigationHandler is now part of the room */}
            <NavigationHandler />
            
            <AvatarVoiceAgent />
            
            <div className="agent-active-ui">
              <p>Receptionist is Online</p>
              <button 
                onClick={() => setShowSupport(false)}
                className="end-call-button"
              >
                End Session
              </button>
            </div>
          </LiveKitRoom>
        ) : (
          <div className="error-status">
            <p>Could not connect to the AI server.</p>
            <button onClick={() => setShowSupport(false)}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveKitWidget;
