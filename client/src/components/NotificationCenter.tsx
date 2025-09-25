import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  AlertTriangle, 
  Cloud, 
  Shield, 
  Navigation, 
  Info, 
  CheckCircle, 
  Clock,
  Volume2,
  VolumeX
} from 'lucide-react';
import { SocketContext } from '../App';
import toast from 'react-hot-toast';

// Workaround for lucide-react typing mismatch with project's React types
const BellIcon: any = Bell;
const XIcon: any = X;
const AlertTriangleIcon: any = AlertTriangle;
const CloudIcon: any = Cloud;
const ShieldIcon: any = Shield;
const NavigationIcon: any = Navigation;
const InfoIcon: any = Info;
const CheckCircleIcon: any = CheckCircle;
const ClockIcon: any = Clock;
const Volume2Icon: any = Volume2;
const VolumeXIcon: any = VolumeX;

interface Notification {
  id: string;
  type: 'weather' | 'security' | 'traffic' | 'general' | 'emergency';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  read: boolean;
  actionButton?: {
    text: string;
    action: () => void;
  };
}

const NotificationCenter: React.FC = () => {
  const { socket, isConnected } = useContext(SocketContext);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (socket) {
      // Listen for various types of notifications
      socket.on('travel-alert', handleTravelAlert);
      socket.on('weather-update', handleWeatherAlert);
      socket.on('security-update', handleSecurityAlert);
      socket.on('traffic-update', handleTrafficAlert);
      socket.on('journey-started', handleJourneyAlert);
      socket.on('location-alert', handleLocationAlert);
      socket.on('emergency-alert', handleEmergencyAlert);

      return () => {
        socket.off('travel-alert');
        socket.off('weather-update');
        socket.off('security-update');
        socket.off('traffic-update');
        socket.off('journey-started');
        socket.off('location-alert');
        socket.off('emergency-alert');
      };
    }
  }, [socket]);

  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  const handleTravelAlert = (data: any) => {
    addNotification({
      type: 'general',
      title: 'Travel Update',
      message: data.message || 'New travel information available',
      severity: data.severity || 'medium',
      timestamp: new Date(data.timestamp || Date.now())
    });
  };

  const handleWeatherAlert = (data: any) => {
    addNotification({
      type: 'weather',
      title: 'Weather Alert',
      message: data.message || 'Weather conditions have changed',
      severity: data.severity || 'medium',
      timestamp: new Date(data.timestamp || Date.now()),
      actionButton: data.suggestedAction ? {
        text: 'View Alternatives',
        action: () => handleWeatherAction(data)
      } : undefined
    });
  };

  const handleSecurityAlert = (data: any) => {
    addNotification({
      type: 'security',
      title: 'Security Alert',
      message: data.message || 'Security situation update',
      severity: data.severity || 'high',
      timestamp: new Date(data.timestamp || Date.now()),
      actionButton: {
        text: 'Safety Tips',
        action: () => showSafetyTips(data)
      }
    });
  };

  const handleTrafficAlert = (data: any) => {
    addNotification({
      type: 'traffic',
      title: 'Traffic Update',
      message: data.message || 'Traffic conditions have changed',
      severity: data.severity || 'low',
      timestamp: new Date(data.timestamp || Date.now()),
      actionButton: {
        text: 'View Route',
        action: () => openRouteView(data)
      }
    });
  };

  const handleJourneyAlert = (data: any) => {
    addNotification({
      type: 'general',
      title: 'Journey Started',
      message: data.message || 'Your journey tracking has begun',
      severity: 'low',
      timestamp: new Date(data.timestamp || Date.now())
    });
  };

  const handleLocationAlert = (data: any) => {
    addNotification({
      type: 'general',
      title: 'Location Update',
      message: data.alerts?.[0]?.message || 'Location-based alert',
      severity: data.alerts?.[0]?.severity || 'medium',
      timestamp: new Date(data.timestamp || Date.now())
    });
  };

  const handleEmergencyAlert = (data: any) => {
    addNotification({
      type: 'emergency',
      title: 'EMERGENCY ALERT',
      message: data.message || 'Immediate attention required',
      severity: 'critical',
      timestamp: new Date(data.timestamp || Date.now())
    });
    
    // Emergency alerts also show as toast
    toast.error(data.message, { duration: 10000 });
    
    // Play sound for emergency alerts regardless of sound setting
    playNotificationSound('emergency');
  };

  const addNotification = (notificationData: Omit<Notification, 'id' | 'read'>) => {
    const notification: Notification = {
      ...notificationData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      read: false
    };

    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep only 50 notifications

    // Play sound if enabled
    if (soundEnabled) {
      playNotificationSound(notification.type);
    }

    // Show toast for high severity alerts
    if (notification.severity === 'high' || notification.severity === 'critical') {
      toast.error(notification.title + ': ' + notification.message);
    }
  };

  const playNotificationSound = (type: string) => {
    // Create different sounds for different notification types
    const audio = new Audio();
    switch (type) {
      case 'emergency':
        // High pitch urgent sound
        audio.src = 'data:audio/wav;base64,UklGRnQEAABXQVZFZm10IAAAAAAQAAAAAAAAAAARAAAAAAAAAAAAZGF0YQAAAAAAAAAAAAAAAAAA';
        break;
      case 'weather':
      case 'security':
        // Medium pitch alert sound
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IAAAAAAQAAAAAAAAAAARAAAAAAAAAAAAZGF0YQAAAAAAAAAAAAAAAAAA';
        break;
      default:
        // Low pitch notification sound
        audio.src = 'data:audio/wav;base64,UklGRlAGAABXQVZFZm10IAAAAAAQAAAAAAAAAAARAAAAAAAAAAAAZGF0YQAAAAAAAAAAAAAAAAAA';
        break;
    }
    audio.volume = 0.3;
    audio.play().catch(() => {}); // Fail silently if audio cannot play
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type: string) => {
    const create = (icon: any) => React.createElement(icon as any, { className: 'w-5 h-5' });
    switch (type) {
      case 'weather': return create(CloudIcon);
      case 'security': return create(ShieldIcon);
      case 'traffic': return create(NavigationIcon);
      case 'emergency': return create(AlertTriangleIcon);
      default: return create(InfoIcon);
    }
  };

  const getNotificationColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    const create = (icon: any) => React.createElement(icon as any, { className: 'w-4 h-4' });
    switch (severity) {
      case 'critical': return create(AlertTriangleIcon);
      case 'high': return create(AlertTriangleIcon);
      case 'medium': return create(InfoIcon);
      case 'low': return create(CheckCircleIcon);
      default: return create(InfoIcon);
    }
  };

  const handleWeatherAction = (data: any) => {
    // Handle weather-specific actions
    toast('Showing weather alternatives...');
    setIsOpen(false);
  };

  const showSafetyTips = (data: any) => {
    // Show safety tips modal or navigate to safety page
    toast('Opening safety guidelines...');
    setIsOpen(false);
  };

  const openRouteView = (data: any) => {
    // Navigate to route view or show route modal
    toast('Opening route view...');
    setIsOpen(false);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <>
      <BellIcon className="w-6 h-6" />
      
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative p-3 rounded-full shadow-lg transition-all duration-200 ${
            isConnected ? 'bg-white text-indigo-600 hover:bg-indigo-50' : 'bg-gray-400 text-gray-600'
          }`}
        >
          <BellIcon className="w-6 h-6" />
          
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
          
          {!isConnected && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          )}
        </button>
      </motion.div>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className="fixed right-4 top-16 w-96 bg-white rounded-lg shadow-lg overflow-hidden z-50"
          >
            <div className="flex items-center justify-between p-2 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-1 hover:bg-gray-100 rounded"
                  title={soundEnabled ? 'Disable sounds' : 'Enable sounds'}
                >
                  {soundEnabled ? <Volume2Icon className="w-4 h-4" /> : <VolumeXIcon className="w-4 h-4" />}
                </button>
                <h3 className="text-sm font-medium">Notifications</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Actions */}
            {notifications.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
                <span className="text-sm text-gray-600">
                  {notifications.length} notifications
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-indigo-600 hover:text-indigo-800"
                  >
                    Mark all read
                  </button>
                  <button
                    onClick={clearAllNotifications}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <BellIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No notifications yet</p>
                  <p className="text-sm">You'll receive real-time travel updates here</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      onClick={() => markAsRead(notification.id)}
                      className={`p-4 border-l-4 cursor-pointer transition-all hover:bg-gray-50 ${
                        !notification.read ? 'bg-blue-50 border-l-indigo-500' : 'border-l-gray-300'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${getNotificationColor(notification.severity)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-semibold text-sm truncate ${
                              !notification.read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center space-x-2 ml-2">
                              {getSeverityIcon(notification.severity)}
                              <span className="text-xs text-gray-500">
                                {formatTime(notification.timestamp)}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-400">
                              {formatDate(notification.timestamp)}
                            </span>
                            
                            <div className="flex items-center space-x-2">
                              {notification.actionButton && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    notification.actionButton!.action();
                                  }}
                                  className="text-xs text-indigo-600 hover:text-indigo-800"
                                >
                                  {notification.actionButton.text}
                                </button>
                              )}
      
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="text-xs text-red-600 hover:text-red-800"
                              >
                                <XIcon className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-gray-50 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500">
                Smart Travel AI • Real-time Monitoring
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NotificationCenter;