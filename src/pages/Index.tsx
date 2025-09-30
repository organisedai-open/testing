import { useState, useEffect } from "react";
import ChannelSidebar from "@/components/ChannelSidebar";
import ChatArea from "@/components/ChatArea";
import UsernamePrompt from "@/components/UsernamePrompt";
import { AppCheckVerification } from "@/components/AppCheckVerification";
import { getSessionId } from "@/utils/session";
import { X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [selectedChannel, setSelectedChannel] = useState("general");
  const [username, setUsername] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSecurityPanel, setShowSecurityPanel] = useState(false);

  useEffect(() => {
    // Check for existing username
    const storedUsername = sessionStorage.getItem("anonymous_username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
    
    setSessionId(getSessionId());
    
    // Add event listener for sidebar toggle
    const handleToggleSidebar = () => setSidebarOpen(prev => !prev);
    window.addEventListener('toggle-sidebar', handleToggleSidebar);
    
    return () => {
      window.removeEventListener('toggle-sidebar', handleToggleSidebar);
    };
  }, []);

  const handleUsernameSet = (newUsername: string) => {
    sessionStorage.setItem("anonymous_username", newUsername);
    setUsername(newUsername);
  };

  // Show username prompt if no username is set
  if (!username) {
    return <UsernamePrompt onUsernameSet={handleUsernameSet} />;
  }

  return (
    <div className="flex h-screen mobile-layout mobile-full-height lg:h-screen overflow-hidden" style={{ backgroundColor: '#1F1C09' }}>
      {/* Security Panel Toggle */}
      <Button
        onClick={() => setShowSecurityPanel(!showSecurityPanel)}
        className="fixed top-4 right-4 z-50 bg-red-600 hover:bg-red-700"
        size="sm"
      >
        <Shield className="h-4 w-4 mr-2" />
        Security
      </Button>

      {/* Security Panel */}
      {showSecurityPanel && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Firebase Security Verification</h2>
              <Button
                onClick={() => setShowSecurityPanel(false)}
                variant="outline"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <AppCheckVerification />
            </div>
          </div>
        </div>
      )}

      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <ChannelSidebar 
          selectedChannel={selectedChannel}
          onChannelSelect={setSelectedChannel}
        />
      </div>

      {/* Sidebar - Mobile */}
      {sidebarOpen && (
        <div className="lg:hidden mobile-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
      <div className={`
        lg:hidden mobile-sidebar
        ${sidebarOpen ? 'open' : ''}
      `}>
        <ChannelSidebar 
          selectedChannel={selectedChannel}
          onChannelSelect={(channel) => {
            setSelectedChannel(channel);
            setSidebarOpen(false);
          }}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Chat Area */}
      <ChatArea 
        channel={selectedChannel}
        username={username}
        sessionId={sessionId}
      />
    </div>
  );
};

export default Index;