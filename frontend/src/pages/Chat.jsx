import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, Typography, Paper, CircularProgress, Alert, Divider, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Snackbar, FormControl, InputLabel, Select, MenuItem, Avatar, Zoom, Fade, Tooltip, Slide, Chip, useTheme } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import HistoryIcon from '@mui/icons-material/History';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import ScheduleIcon from '@mui/icons-material/Schedule';
import MicNoneIcon from '@mui/icons-material/MicNone';
import ChatIcon from '@mui/icons-material/Chat';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { Layout, ChatMessage, TypingIndicator } from '../components';
import { chatService } from '../services/api';
import { authService } from '../services/authService';
import { appointmentService } from '../services/api';

// Animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -500px 0; }
  100% { background-position: 500px 0; }
`;

// Styled components
const ChatContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100vh - 180px)',
  maxWidth: 900,
  margin: '0 auto',
  position: 'relative',
  [theme.breakpoints.down('sm')]: {
    height: 'calc(100vh - 140px)',
  },
}));

const ChatHeader = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  borderRadius: '16px',
  background: theme.palette.mode === 'dark'
    ? theme.palette.gradients.purpleMild
    : theme.palette.gradients.blueMild,
  backgroundSize: '200% 200%',
  animation: `${gradientMove} 15s ease infinite`,
  color: 'white',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  boxShadow: theme.palette.mode === 'dark'
    ? '0 4px 20px rgba(0, 0, 0, 0.4)'
    : '0 4px 20px rgba(0, 0, 0, 0.1)',
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
    pointerEvents: 'none',
  }
}));

const AnimatedAvatar = styled(Avatar)(({ theme }) => ({
  width: 50,
  height: 50,
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, #9C27B0, #BA68C8)'
    : 'linear-gradient(135deg, #1976D2, #42A5F5)',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 0 20px rgba(156, 39, 176, 0.5)'
    : '0 0 20px rgba(25, 118, 210, 0.5)',
  animation: `${float} 3s ease-in-out infinite`,
  marginRight: theme.spacing(2),
}));

const MessagesContainer = styled(Paper)(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: '16px',
  background: theme.palette.mode === 'dark' 
    ? 'rgba(30, 30, 30, 0.7)'
    : 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  position: 'relative',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 8px 32px rgba(0, 0, 0, 0.3)'
    : '0 8px 32px rgba(0, 0, 0, 0.1)',
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(255, 255, 255, 0.05)'
    : '1px solid rgba(255, 255, 255, 0.5)',
  scrollbarWidth: 'thin',
  scrollbarColor: theme.palette.mode === 'dark'
    ? '#9C27B0 #1E1E1E'
    : '#1976D2 #F5F7FA',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.mode === 'dark' ? '#1E1E1E' : '#F5F7FA',
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.mode === 'dark' ? 'rgba(156, 39, 176, 0.5)' : 'rgba(25, 118, 210, 0.5)',
    borderRadius: '10px',
    '&:hover': {
      background: theme.palette.mode === 'dark' ? 'rgba(156, 39, 176, 0.8)' : 'rgba(25, 118, 210, 0.8)',
    }
  }
}));

const WelcomeMessage = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginTop: '20%',
  padding: theme.spacing(4),
  animation: `${pulse} 2s ease-in-out infinite`,
}));

const InputContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  alignItems: 'center',
  borderRadius: 16,
  background: theme.palette.mode === 'dark' 
    ? 'rgba(38, 38, 38, 0.7)'
    : 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  padding: theme.spacing(1.5, 2),
  boxShadow: theme.palette.mode === 'dark'
    ? '0 4px 20px rgba(0, 0, 0, 0.3)'
    : '0 4px 20px rgba(0, 0, 0, 0.1)',
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(255, 255, 255, 0.05)'
    : '1px solid rgba(255, 255, 255, 0.5)',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: theme.spacing(1.2, 3),
  boxShadow: theme.palette.mode === 'dark'
    ? '0 4px 10px rgba(156, 39, 176, 0.3)'
    : '0 4px 10px rgba(25, 118, 210, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 6px 14px rgba(156, 39, 176, 0.4)'
      : '0 6px 14px rgba(25, 118, 210, 0.4)',
  },
}));

const IconBtn = styled(IconButton)(({ theme }) => ({
  background: theme.palette.mode === 'dark' 
    ? 'rgba(156, 39, 176, 0.2)'
    : 'rgba(25, 118, 210, 0.1)',
  backdropFilter: 'blur(5px)',
  marginRight: theme.spacing(1),
  transition: 'all 0.2s ease',
  '&:hover': {
    background: theme.palette.mode === 'dark'
      ? 'rgba(156, 39, 176, 0.3)'
      : 'rgba(25, 118, 210, 0.2)',
    transform: 'scale(1.05)',
  },
}));

const HistoryDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    background: theme.palette.mode === 'dark' 
      ? 'rgba(38, 38, 38, 0.95)'
      : 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 25px 50px rgba(0, 0, 0, 0.5)'
      : '0 25px 50px rgba(0, 0, 0, 0.2)',
    overflow: 'hidden',
  }
}));

const SessionItem = styled(ListItem)(({ theme, active }) => ({
  borderRadius: '10px',
  margin: '4px 0',
  transition: 'all 0.2s ease',
  background: active
    ? theme.palette.mode === 'dark' 
      ? 'rgba(156, 39, 176, 0.2)' 
      : 'rgba(25, 118, 210, 0.1)'
    : 'transparent',
  '&:hover': {
    background: theme.palette.mode === 'dark' 
      ? 'rgba(156, 39, 176, 0.1)' 
      : 'rgba(25, 118, 210, 0.05)',
    transform: 'translateX(5px)',
  }
}));

const BookingDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    background: theme.palette.mode === 'dark' 
      ? 'rgba(38, 38, 38, 0.95)'
      : 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 25px 50px rgba(0, 0, 0, 0.5)'
      : '0 25px 50px rgba(0, 0, 0, 0.2)',
    overflow: 'hidden',
  }
}));

const DialogHeaderGradient = styled(DialogTitle)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? theme.palette.gradients.purpleMild
    : theme.palette.gradients.blueMild,
  color: 'white',
  backgroundSize: '200% 200%',
  animation: `${gradientMove} 15s ease infinite`,
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '10%',
    right: '10%',
    height: '1px',
    background: 'rgba(255, 255, 255, 0.2)',
  }
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  fontWeight: 'bold',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 2px 5px rgba(0, 0, 0, 0.3)'
    : '0 2px 5px rgba(0, 0, 0, 0.1)',
  margin: theme.spacing(1, 0.5),
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 4px 8px rgba(0, 0, 0, 0.4)'
      : '0 4px 8px rgba(0, 0, 0, 0.15)',
  }
}));

const shimmerStyles = {
  position: 'relative',
  background: 'rgba(255, 255, 255, 0.1)',
  backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.2) 20%, rgba(255, 255, 255, 0.1) 40%, rgba(255, 255, 255, 0.1) 100%)',
  backgroundSize: '1000px 100%',
  animation: `${shimmer} 2s infinite linear`,
};

const Chat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [apiError, setApiError] = useState('');
  const [userSessions, setUserSessions] = useState([]);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [fullResponse, setFullResponse] = useState('');
  const [typingSpeed, setTypingSpeed] = useState({ min: 1, max: 2 }); // milliseconds per character
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const isAuthenticated = authService.isAuthenticated();
  const [user, setUser] = useState(null);
  const theme = useTheme();
  
  // Add these new states for booking
  const [openBookingDialog, setOpenBookingDialog] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');
  const [detectedSpecialty, setDetectedSpecialty] = useState('');
  const [availableSchedules, setAvailableSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [bookingError, setBookingError] = useState('');
  
  // New state for showing welcome animations
  const [showWelcome, setShowWelcome] = useState(true);
  const [initFinished, setInitFinished] = useState(false);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        setLoading(true);
        // Check if we have a session in localStorage
        const savedSessionId = localStorage.getItem('chatSessionId');
        
        if (savedSessionId) {
          console.log("Found existing session:", savedSessionId);
          setSessionId(savedSessionId);
          try {
            const response = await chatService.getChatHistory(savedSessionId);
            if (response.success && response.messages) {
              console.log("Loaded chat history:", response.messages);
              setMessages(response.messages);
              setShowWelcome(false);
            }
          } catch (historyError) {
            console.error("Failed to load chat history:", historyError);
            // If there's an error with the existing session, start a new one
            startNewSession();
          }
        } else {
          // Initialize a new chat session
          startNewSession();
        }
        
        // If user is authenticated, fetch their sessions
        if (isAuthenticated) {
          fetchUserSessions();
        }
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        setApiError('لا يمكن الاتصال بالخادم. يرجى المحاولة مرة أخرى لاحقًا.');
      } finally {
        setLoading(false);
        setInitFinished(true);
      }
    };

    initializeChat();
    
    // If user is authenticated, get user data
    if (isAuthenticated) {
      fetchUserData();
    }
    
    // Hide welcome message after 5 seconds
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingText]); // Also scroll when typing text updates

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    let typingTimer;
    
    if (isTyping && fullResponse) {
      const currentLength = typingText.length;
      
      if (currentLength < fullResponse.length) {
        // Calculate a random delay between min and max for natural typing feel
        const delay = Math.floor(Math.random() * 
          (typingSpeed.max - typingSpeed.min + 1)) + typingSpeed.min;
        
        // Add multiple characters at once to increase speed (3-8 chars per update)
        const charsToAdd = Math.floor(Math.random() * 6) + 3; 
        const newLength = Math.min(currentLength + charsToAdd, fullResponse.length);
        
        typingTimer = setTimeout(() => {
          setTypingText(fullResponse.substring(0, newLength));
        }, delay);
      } else {
        // Typing complete, update the actual messages array with the full response
        setIsTyping(false);
        
        // Create a new message object with a unique ID to force re-render
        const completedMessage = {
          id: uuidv4(), 
          role: 'assistant',
          content: fullResponse,
          timestamp: new Date()
        };
        
        // Replace the temporary typing message with the completed one
        setMessages(prev => {
          const updatedMessages = [...prev];
          updatedMessages[updatedMessages.length - 1] = completedMessage;
          return updatedMessages;
        });
      }
    }
    
    return () => clearTimeout(typingTimer);
  }, [isTyping, typingText, fullResponse, typingSpeed]);

  const startNewSession = async () => {
    try {
      console.log("Starting new chat session");
      setLoading(true);
      const response = await chatService.initChat();
      if (response.success && response.sessionId) {
        console.log("New session created:", response.sessionId);
        setSessionId(response.sessionId);
        localStorage.setItem('chatSessionId', response.sessionId);
        setMessages([]);
      } else {
        throw new Error("Failed to create session");
      }
    } catch (error) {
      console.error("Error creating new session:", error);
      setApiError('فشل إنشاء جلسة جديدة. يرجى تحديث الصفحة.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSessions = async () => {
    try {
      setLoadingSessions(true);
      const response = await chatService.getUserSessions();
      if (response.success) {
        setUserSessions(response.sessions);
      }
    } catch (error) {
      console.error('Failed to fetch user sessions:', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const loadSession = async (sessionToLoad) => {
    try {
      setLoading(true);
      setApiError('');
      const response = await chatService.getChatHistory(sessionToLoad);
      if (response.success && response.messages) {
        setSessionId(sessionToLoad);
        localStorage.setItem('chatSessionId', sessionToLoad);
        setMessages(response.messages);
        setIsHistoryDialogOpen(false);
      } else {
        throw new Error("Failed to load session");
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      setApiError('فشل تحميل المحادثة السابقة');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const messageId = uuidv4();
    const userMessage = { id: messageId, role: 'user', content: input };
    
    // Add user message with a slide-in effect
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setApiError('');
    
    try {
      console.log(`Sending message to session ${sessionId}:`, input);
      const response = await chatService.sendMessage(sessionId, input);
      console.log("Response from server:", response);
      if (response.success) {
        if (response.redirect) {
          navigate(response.redirectTo);
        } else if (response.message) {
          // Start the typing effect instead of immediately showing the message
          const botResponse = response.message.content;
          const tempBotMessage = { 
            id: uuidv4(), 
            role: 'assistant',
            content: '', // Start empty
            isTyping: true
          };
          
          // Add temporary message to show the bot is typing
          setMessages(prev => [...prev, tempBotMessage]);
          
          // Set up the typing effect
          setFullResponse(botResponse);
          setTypingText('');
          setIsTyping(true);
          
          // Show welcome message only for the first exchange
          setShowWelcome(false);
        }
      } else {
        throw new Error(response.message || "Unknown error");
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, {
        id: uuidv4(),
        role: 'assistant',
        content: 'عذراً، حدث خطأ في معالجة رسالتك. يرجى المحاولة مرة أخرى.'
      }]);
      setApiError('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const clearSession = () => {
    localStorage.removeItem('chatSessionId');
    setMessages([]);
    setSessionId('');
    setApiError('');
    startNewSession();
  };

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('ar-EG', options);
  };

  const fetchUserData = async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response.success) {
        setUser(response.user);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const handleBooking = async (messageContent, specialty) => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }
  
    setBookingMessage(messageContent);
    setDetectedSpecialty(specialty || '');
    setOpenBookingDialog(true);
    setSelectedSchedule('');
    setBookingError('');
    
    // Try to fetch available schedules if a specialty is detected
    if (specialty) {
      try {
        setLoadingSchedules(true);
        console.log(`Fetching schedules for specialty: ${specialty}`);
        
        const response = await appointmentService.getAvailableSchedulesBySpecialty(specialty);
        
        console.log('Server response for available schedules:', response);
        
        if (response.success && response.schedules && response.schedules.length > 0) {
          console.log(`Found ${response.schedules.length} available schedules for ${specialty}`);
          setAvailableSchedules(response.schedules);
        } else {
          console.log(`No available schedules found for ${specialty}`);
          setAvailableSchedules([]);
        }
      } catch (error) {
        console.error('Failed to fetch available schedules:', error);
        setAvailableSchedules([]);
      } finally {
        setLoadingSchedules(false);
      }
    } else {
      // No specialty detected
      setAvailableSchedules([]);
    }
  };

  const handleCloseBookingDialog = () => {
    setOpenBookingDialog(false);
    setBookingMessage('');
    setSelectedSchedule('');
    setBookingError('');
  };

  const handleScheduleSelect = (event) => {
    setSelectedSchedule(event.target.value);
  };

  const handleConfirmBooking = async () => {
    // If no schedules available, send SMS booking
    if (availableSchedules.length === 0) {
      try {
        // Extract important information from message to include in the SMS
        const truncatedMessage = bookingMessage.length > 100 
          ? bookingMessage.substring(0, 100) + '...' 
          : bookingMessage;

        // Call the API to send SMS - Make sure to include user.age
        const response = await chatService.sendBookingSMS({
          phone: user.phone,
          name: user.name,
          age: user.age, // Add age explicitly
          email: user.email, // Add email to ensure all user data is sent
          messageContent: truncatedMessage,
          specialty: detectedSpecialty
        });
        
        if (response.success) {
          setSnackbarMessage('تم إرسال طلب الحجز وسيتم التواصل معك قريبًا');
          setSnackbarOpen(true);
          
          // Add assistant response about the booking
          setMessages(prev => [...prev, {
            id: uuidv4(),
            role: 'assistant',
            content: 'تم استلام طلب الحجز الخاص بك وسيتم التواصل معك في أقرب وقت لتحديد موعد مناسب.'
          }]);
          
          handleCloseBookingDialog();
        }
      } catch (error) {
        console.error('Failed to send booking request:', error);
        setBookingError('حدث خطأ أثناء إرسال طلب الحجز. يرجى المحاولة مرة أخرى.');
      }
    } else {
      // Book with selected schedule
      if (!selectedSchedule) {
        setBookingError('يرجى اختيار موعد من القائمة');
        return;
      }

      try {
        const schedule = availableSchedules.find(s => s._id === selectedSchedule);
        
        const appointmentData = {
          name: user.name,
          age: user.age, // Make sure age is explicitly included
          phone: user.phone,
          email: user.email,
          scheduleId: selectedSchedule,
          notes: bookingMessage.substring(0, 500)
        };
        
        console.log("Sending appointment data:", appointmentData); // Debugging
        
        const response = await appointmentService.bookAppointment(appointmentData);
        
        if (response.success) {
          setSnackbarMessage('تم حجز موعدك بنجاح!');
          setSnackbarOpen(true);
          
          // Add assistant response about the booking
          setMessages(prev => [...prev, {
            id: uuidv4(),
            role: 'assistant',
            content: `تم حجز موعدك بنجاح مع د. ${schedule.doctorName} يوم ${formatDate(schedule.appointmentDate)} الساعة ${schedule.startTime}.`
          }]);
          
          handleCloseBookingDialog();
        }
      } catch (error) {
        console.error('Failed to book appointment:', error);
        setBookingError('حدث خطأ أثناء حجز الموعد. يرجى المحاولة مرة أخرى.');
      }
    }
  };

  const formatScheduleDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };
  
  // Speech recognition placeholder
  const startSpeechRecognition = () => {
    // This would be implemented with Web Speech API
    setSnackbarMessage('خاصية التحدث ستتوفر قريباً!');
    setSnackbarOpen(true);
  };

  return (
    <Layout title="المساعد الطبي">
      <ChatContainer>
        <Fade in={initFinished} timeout={800}>
          <ChatHeader>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AnimatedAvatar>
                <HealthAndSafetyIcon sx={{ fontSize: 30 }} />
              </AnimatedAvatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  IPARPA - المساعد الطبي الذكي
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  استشر المساعد الطبي وسأقوم بمساعدتك
                </Typography>
              </Box>
            </Box>
            <Box>
              <Tooltip title="محادثة جديدة">
                <IconBtn
                  color="inherit"
                  onClick={clearSession}
                  disabled={loading}
                  size="small"
                >
                  <AddIcon />
                </IconBtn>
              </Tooltip>
              
              {isAuthenticated && (
                <Tooltip title="المحادثات السابقة">
                  <IconBtn
                    color="inherit"
                    onClick={() => setIsHistoryDialogOpen(true)}
                    disabled={loading}
                    size="small"
                  >
                    <HistoryIcon />
                  </IconBtn>
                </Tooltip>
              )}
            </Box>
          </ChatHeader>
        </Fade>
        
        {apiError && (
          <Slide direction="down" in={true}>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2, 
                borderRadius: 2,
                boxShadow: 3
              }}
              onClose={() => setApiError('')}
            >
              {apiError}
            </Alert>
          </Slide>
        )}
        
        <Zoom in={initFinished} timeout={500} style={{ transitionDelay: '200ms' }}>
          <MessagesContainer>
            {messages.length === 0 ? (
              <WelcomeMessage>
                {showWelcome ? (
                  <Fade in={showWelcome} timeout={1000}>
                    <Box>
                      <Box sx={{ mb: 3 }}>
                        <Avatar 
                          sx={{
                            bgcolor: theme.palette.mode === 'dark' ? 'primary.main' : 'primary.dark',
                            width: 100,
                            height: 100,
                            margin: '0 auto 24px',
                            boxShadow: theme.palette.mode === 'dark' 
                              ? '0 0 30px rgba(156, 39, 176, 0.6)' 
                              : '0 0 30px rgba(25, 118, 210, 0.6)',
                            animation: `${float} 3s ease-in-out infinite`
                          }}
                        >
                          <HealthAndSafetyIcon sx={{ fontSize: 60 }} />
                        </Avatar>
                      </Box>
                      <Typography 
                        variant="h5" 
                        sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}
                      >
                        مرحباً بك في المساعد الطبي الذكي
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        جاري تحضير المساعد الطبي لمساعدتك...
                      </Typography>
                    </Box>
                  </Fade>
                ) : (
                  <Fade in={!showWelcome && messages.length === 0} timeout={1000}>
                    <Box>
                      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
                        ابدأ محادثتك مع المساعد الطبي
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                        يمكنك سؤالي عن أي استفسار طبي وسأحاول مساعدتك بأفضل شكل ممكن
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
                        <StyledChip 
                          label="كيف يمكنني التعامل مع الصداع؟" 
                          color="primary" 
                          variant="outlined" 
                          onClick={() => setInput("كيف يمكنني التعامل مع الصداع؟")}
                          clickable
                        />
                        <StyledChip 
                          label="ما هي أعراض نزلات البرد؟" 
                          color="primary" 
                          variant="outlined" 
                          onClick={() => setInput("ما هي أعراض نزلات البرد؟")}
                          clickable
                        />
                        <StyledChip 
                          label="كيف أحافظ على صحة القلب؟" 
                          color="primary" 
                          variant="outlined" 
                          onClick={() => setInput("كيف أحافظ على صحة القلب؟")}
                          clickable
                        />
                      </Box>
                    </Box>
                  </Fade>
                )}
              </WelcomeMessage>
            ) : (
              <>
                {messages.map((msg, index) => (
                  <Fade 
                    key={`${msg.id || msg._id}-${Date.now()}-${index}`} 
                    in={true} 
                    timeout={500}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <Box>
                      <ChatMessage 
                        message={msg} 
                        onBooking={handleBooking}
                      />
                    </Box>
                  </Fade>
                ))}
                
                {/* Show typing indicator during active typing */}
                {isTyping && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', mr: 1 }}>
                      <HealthAndSafetyIcon />
                    </Avatar>
                    <Paper sx={{ 
                      backgroundColor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
                      padding: 2, 
                      borderRadius: '0 15px 15px 15px', 
                      maxWidth: '70%',
                      position: 'relative'
                    }}>
                      <Typography variant="body1">{typingText}</Typography>
                      {typingText && typingText.length === fullResponse.length ? null : (
                        <Box sx={{ mt: 1 }}>
                          <TypingIndicator />
                        </Box>
                      )}
                    </Paper>
                  </Box>
                )}
              </>
            )}
            {loading && !isTyping && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <CircularProgress size={40} />
              </Box>
            )}
            <div ref={messagesEndRef} />
          </MessagesContainer>
        </Zoom>
        
        <Zoom in={initFinished} timeout={500} style={{ transitionDelay: '300ms' }}>
          <InputContainer component="form" onSubmit={handleSendMessage}>
            <Tooltip title="المساعدة الصوتية">
              <IconButton 
                color="primary"
                onClick={startSpeechRecognition}
                sx={{
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(156, 39, 176, 0.1)' : 'rgba(25, 118, 210, 0.05)',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(156, 39, 176, 0.2)' : 'rgba(25, 118, 210, 0.1)',
                  }
                }}
              >
                <MicNoneIcon />
              </IconButton>
            </Tooltip>
            
            <TextField
              fullWidth
              variant="outlined"
              placeholder="اكتب استفسارك هنا..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              InputProps={{
                sx: { 
                  borderRadius: '12px',
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)',
                }
              }}
            />
            
            <StyledButton
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || !input.trim() || !sessionId}
              endIcon={<SendIcon />}
            >
              إرسال
            </StyledButton>
          </InputContainer>
        </Zoom>
        
        {/* Previous Chats Dialog */}
        <HistoryDialog 
          open={isHistoryDialogOpen} 
          onClose={() => setIsHistoryDialogOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogHeaderGradient>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <HistoryIcon sx={{ mr: 1 }} />
                <Typography variant="h6">المحادثات السابقة</Typography>
              </Box>
              <IconButton onClick={() => setIsHistoryDialogOpen(false)} sx={{ color: 'white' }}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogHeaderGradient>
          
          <DialogContent dividers>
            {loadingSessions ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                <CircularProgress size={40} />
              </Box>
            ) : userSessions.length === 0 ? (
              <Typography variant="body1" align="center" color="text.secondary" sx={{ my: 3 }}>
                لا توجد محادثات سابقة
              </Typography>
            ) : ( 
              <List sx={{ width: '100%' }}>
                {userSessions.map((session, index) => {
                  // Add safety checks to prevent accessing properties of undefined
                  const firstQuestion = session.conversations && 
                                       Array.isArray(session.conversations) && 
                                       session.conversations.length > 0 ? 
                                       session.conversations[0]?.question : '';
                                       
                  const contextTitle = session.contextTitle || 
                                     (firstQuestion?.length > 30 ? firstQuestion.substring(0, 30) + "..." : firstQuestion) || 
                                     `محادثة ${index + 1}`;
                  
                  return (
                    <React.Fragment key={session.sessionId || index}>
                      <SessionItem
                        button 
                        onClick={() => loadSession(session.sessionId)}
                        active={session.sessionId === sessionId}
                      >
                        <Box sx={{ display: 'flex', width: '100%' }}>
                          <Avatar sx={{ 
                            mr: 2, 
                            bgcolor: theme.palette.mode === 'dark' ? 'primary.main' : 'primary.main',
                            width: 40,
                            height: 40
                          }}>
                            <ChatIcon fontSize="small" />
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {contextTitle} 
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {formatDate(session.lastMessageDate || new Date())} - {session.messageCount || 0} رسائل
                            </Typography>
                          </Box>
                        </Box>
                      </SessionItem>
                      {index < userSessions.length - 1 && <Divider component="li" sx={{ margin: '4px 0' }} />}
                    </React.Fragment>
                  );
                })}
              </List>
            )}
          </DialogContent>
          
          <DialogActions sx={{ justifyContent: 'space-between', p: 2 }}>
            <Button 
              onClick={() => setIsHistoryDialogOpen(false)} 
              color="inherit"
              variant="text"
            >
              إغلاق
            </Button>
            <Button 
              onClick={() => {
                clearSession();
                setIsHistoryDialogOpen(false);
              }} 
              color="primary"
              variant="contained"
              startIcon={<AddIcon />}
            >
              محادثة جديدة
            </Button>
          </DialogActions>
        </HistoryDialog>
        
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          message={snackbarMessage}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
        
        {/* Booking dialog */}
        <BookingDialog open={openBookingDialog} onClose={handleCloseBookingDialog} maxWidth="md" fullWidth>
          <DialogHeaderGradient>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ScheduleIcon sx={{ mr: 1 }} />
              <Typography variant="h6">حجز موعد طبي</Typography>
            </Box>
          </DialogHeaderGradient>
          
          <DialogContent sx={{ py: 3 }}>
            {bookingError && (
              <Alert severity="error" sx={{ mb: 3, mt: 1 }} onClose={() => setBookingError('')}>
                {bookingError}
              </Alert>
            )}
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                {detectedSpecialty ? (
                  <>
                    بناءً على استشارتك، يظهر أنك بحاجة إلى مراجعة طبيب <Chip color="primary" label={detectedSpecialty} size="small" sx={{ mx: 0.5 }} />
                  </>
                ) : (
                  <>لم نتمكن من تحديد التخصص المناسب من استشارتك</>
                )}
              </Typography>
              
              <Paper variant="outlined" sx={{ p: 2, backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  استشارتك: {bookingMessage.substring(0, 150)}{bookingMessage.length > 150 ? '...' : ''}
                </Typography>
              </Paper>
            </Box>
            
            {loadingSchedules ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', my: 4 }}>
                <CircularProgress size={40} sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  جاري البحث عن مواعيد متاحة...
                </Typography>
              </Box>
            ) : availableSchedules.length > 0 ? (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                  <ScheduleIcon sx={{ mr: 1 }} />
                  يوجد {availableSchedules.length} مواعيد متاحة:
                </Typography>
                
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel id="schedule-select-label">اختر موعدًا مناسبًا</InputLabel>
                  <Select
                    labelId="schedule-select-label"
                    value={selectedSchedule}
                    label="اختر موعدًا مناسبًا"
                    onChange={handleScheduleSelect}
                  >
                    <MenuItem value="" disabled>اختر موعدًا من القائمة</MenuItem>
                    {availableSchedules.map((schedule) => (
                      <MenuItem key={schedule._id} value={schedule._id} sx={{ py: 1.5 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="subtitle1">
                            د. {schedule.doctorName} - {schedule.specialty}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatScheduleDate(schedule.appointmentDate)} - {schedule.startTime}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Typography variant="body2" sx={{ mt: 2, color: 'success.main' }}>
                  * يمكنك اختيار الموعد المناسب وسيتم حجزه على الفور
                </Typography>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body1" sx={{ mb: 2, fontWeight: 'medium' }}>
                  لا توجد مواعيد متاحة حاليًا{detectedSpecialty ? ` مع أطباء ${detectedSpecialty}` : ''}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  يمكننا استلام طلب حجز وسيتم التواصل معك هاتفيًا لتحديد موعد مناسب
                </Typography>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 200, 83, 0.1)' : 'rgba(0, 200, 83, 0.05)',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'success.main'
                  }}
                >
                  <Typography variant="body2" color="success.main">
                    سيتم إرسال طلب الحجز إلى الفريق الطبي وسيتواصلون معك على رقم {user?.phone} في أقرب وقت ممكن
                  </Typography>
                </Paper>
              </Box>
            )}
          </DialogContent>
          
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button 
              onClick={handleCloseBookingDialog} 
              color="inherit"
              variant="outlined"
            >
              إلغاء
            </Button>
            <Button 
              onClick={handleConfirmBooking} 
              variant="contained" 
              color="primary"
              startIcon={<ScheduleIcon />}
            >
              {availableSchedules.length > 0 ? 'تأكيد الحجز' : 'إرسال طلب حجز'}
            </Button>
          </DialogActions>
        </BookingDialog>
      </ChatContainer>
    </Layout>
  );
};

export default Chat;