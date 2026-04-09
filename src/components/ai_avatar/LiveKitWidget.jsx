import { useState, useCallback, useEffect } from "react";
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";
import AvatarVoiceAgent from "./AvatarVoiceAgent";
import "./LiveKitWidget.css";

const LiveKitWidget = ({ setShowSupport }) => {
  const [token, setToken] = useState(null);
  const [lkUrl, setLkUrl] = useState(null); // Added state for the URL
  const [isConnecting, setIsConnecting] = useState(true);

  const getToken = useCallback(async () => {
    try {
      console.log("Fetching token from backend...");
      const response = await fetch(
        `/api/getToken?name=${encodeURIComponent("admin")}`
      );
      
      // FIX 1: Parse as JSON, not Text
      const data = await response.json();
      
      if (data.token && data.url) {
        setToken(data.token);
        setLkUrl(data.url); // FIX 2: Use the URL sent by your Python script
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
            <div className="loading-spinner"></div> {/* Add a spinner in your CSS */}
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
            serverUrl={lkUrl} // Using the URL from state
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
            <AvatarVoiceAgent />
            
            {/* Standard Disconnect UI */}
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
