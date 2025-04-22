import React, { useMemo } from 'react';
import { Box, Paper, Typography, Avatar, Button, Tooltip, Divider } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { styled } from '@mui/material/styles';
import { authService } from '../services/authService';

const UserMessagePaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(156, 39, 176, 0.8)' 
    : theme.palette.primary.main,
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(123, 31, 162, 0.9) 0%, rgba(156, 39, 176, 0.9) 100%)'
    : 'linear-gradient(135deg, rgba(21, 101, 192, 0.9) 0%, rgba(25, 118, 210, 0.9) 100%)',
  color: '#ffffff',
  padding: theme.spacing(2),
  borderRadius: '15px 0 15px 15px',
  maxWidth: '70%',
  marginLeft: 'auto',
  marginBottom: theme.spacing(2),
  boxShadow: theme.palette.mode === 'dark'
    ? '0 4px 12px rgba(156, 39, 176, 0.3)'
    : '0 4px 12px rgba(25, 118, 210, 0.3)',
  border: theme.palette.mode === 'dark'
    ? `1px solid rgba(186, 104, 200, 0.5)`
    : `1px solid rgba(66, 165, 245, 0.5)`,
  backdropFilter: 'blur(8px)',
  '& .MuiTypography-root': {
    fontWeight: 500,
    color: '#ffffff',
    textShadow: '0px 1px 2px rgba(0,0,0,0.1)',
    letterSpacing: '0.01em',
  }
}));

const BotMessagePaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark'
    ? 'rgba(30, 30, 30, 0.9)'
    : '#F8F9FA',
  padding: theme.spacing(2),
  borderRadius: '0 15px 15px 15px',
  maxWidth: '70%',
  marginBottom: theme.spacing(2),
  boxShadow: theme.palette.mode === 'dark'
    ? '0 2px 8px rgba(0, 0, 0, 0.2)'
    : '0 2px 8px rgba(0, 0, 0, 0.05)',
  border: theme.palette.mode === 'dark'
    ? `1px solid rgba(255, 255, 255, 0.1)`
    : `1px solid rgba(0, 0, 0, 0.08)`,
  backdropFilter: 'blur(8px)',
  '& .MuiTypography-root': {
    color: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.9)'
      : 'rgba(0, 0, 0, 0.87)',
  }
}));

const ChatMessage = ({ message, onBooking }) => {
  const isUser = message.role === 'user';
  const isAuthenticated = authService.isAuthenticated();
  
  // Add a unique key for the component based on message ID and content
  const messageKey = useMemo(() => 
    `${message.id || message._id}-${message.content?.substring(0, 20) || ''}-${Date.now()}`, 
    [message.id, message._id, message.content]
  );

  // Extract specialty from message content using keywords
  const detectedSpecialty = useMemo(() => {
    if (!isUser && message.content) {
      const specialtyKeywords = {
        "عظام": ["عظام", "كسر", "مفصل", "التهاب المفاصل", "الركبة", "الظهر", "العظم", "آلام المفاصل", "هشاشة", "اصابة رياضية", "خشونة"],
        "قلب": ["قلب", "ضغط الدم", "الشريان", "نبض", "ذبحة", "صدرية", "جلطة", "الشرايين", "الاوردة", "القلبية", "تصلب الشرايين", "خفقان"],
        "جراحة": ["جراحة", "عملية", "استئصال", "شق", "جرح", "تدخل جراحي", "تخدير", "فتح", "بنج", "عملية جراحية"],
        "عيون": ["عيون", "نظر", "عدسة", "رؤية", "عمى", "قرنية", "شبكية", "رمش", "جفن", "جفاف العين", "غشاء العين", "عدسة لاصقة", "نظارة"],
        "أطفال": ["طفل", "أطفال", "الرضع", "رضيع", "الطفولة", "الحضانة", "مواليد", "الرضاعة", "التطعيم", "الولادة", "مص", "اللعب", "بكاء"],
        "جهاز هضمي": ["جهاز هضمي", "معدة", "أمعاء", "هضم", "قولون", "مرارة", "بنكرياس", "قرحة معدية", "قيء", "حرقة", "مصران", "جشاء", "براز", "فضلات"],
        "جلدية": ["جلد", "طفح", "بشرة", "حساسية", "اكزيما", "حبوب", "صدفية", "الاكزيما", "الجرب", "بثور", "حكة", "هرش", "احمرار", "جدري", "حساسية الجلد"],
        "أسنان": ["أسنان", "ضرس", "لثة", "تسوس", "ألم الأسنان", "حشو", "تقويم", "خلع", "طربوش", "جسر", "جذر", "ضرس العقل", "فرشاة أسنان", "معجون أسنان"],
        "نساء وتوليد": ["نساء", "توليد", "حمل", "ولادة", "رحم", "الطمث", "البلوغ", "الدورة", "المبيض", "انقطاع الطمث", "حيض", "تأخر الدورة", "إجهاض", "حامل"],
        "مخ و اعصاب": ["مخ", "أعصاب", "عصبي", "صداع", "شقيقة", "صرع", "شلل", "تنميل", "رعشة", "دوخة", "دوار", "غيبوبة", "فقدان الوعي", "ارتجاج", "وخز"],
        "أنف وأذن وحنجرة": ["أنف", "أذن", "حنجرة", "سمع", "سينوزيت", "لوز", "حلق", "الجيوب الأنفية", "التهاب الأذن", "نزيف الأنف", "انسداد الانف", "طنين"],
        "مسالك بولية": ["مسالك بولية", "كلية", "مثانة", "بول", "تبول", "حصوة", "حرقان البول", "التهاب المثانة", "كلى", "تكرار التبول", "بروستاتا", "حالب"],
        "غدد صماء": ["غدد صماء", "سكري", "سكر", "هرمون", "درقية", "أنسولين", "غدة", "ارتفاع السكر", "انخفاض السكر", "هرمونات", "بلوغ مبكر", "هرمون النمو"],
        "طب نفسي": ["طب نفسي", "نفسي", "اكتئاب", "قلق", "توتر", "وسواس", "اضطراب", "رهاب", "خوف", "هلع", "انطواء", "عزلة", "تعب نفسي", "أفكار سلبية"]
      };

      const content = message.content.toLowerCase();
      console.log("Analyzing message content for specialty detection:", content);
      
      // Check for specialty keywords
      for (const [specialty, keywords] of Object.entries(specialtyKeywords)) {
        if (keywords.some(keyword => content.includes(keyword))) {
          console.log(`Detected specialty: ${specialty} in message`);
          return specialty;
        }
      }

      console.log("No specialty detected, defaulting to باطنة");
      // No match found, return "باطنة" as default
      return "باطنة";
    }
    return null;
  }, [isUser, message.content]);

  return (
    <Box 
      key={messageKey}
      sx={{ display: 'flex', alignItems: 'flex-start', mb: 2, flexDirection: isUser ? 'row-reverse' : 'row' }}
      data-testid={`message-${isUser ? 'user' : 'bot'}`}
    >
      <Avatar sx={{ 
        bgcolor: isUser ? 'primary.main' : 'secondary.main',
        mr: isUser ? 0 : 1,
        ml: isUser ? 1 : 0,
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',  // Added shadow to avatar
      }}>
        {isUser ? <PersonIcon /> : <HealthAndSafetyIcon />}
      </Avatar>
      
      {isUser ? (
        <UserMessagePaper elevation={3}>  {/* Increased elevation for more shadow */}
          <Typography variant="body1">{message.content}</Typography>
        </UserMessagePaper>
      ) : (
        <Box sx={{ maxWidth: '70%' }}>
          <BotMessagePaper>
            <Typography variant="body1">{message.content}</Typography>
          </BotMessagePaper>
          
          {/* Show booking button for assistant messages when user is authenticated and the message has content */}
          {!isUser && isAuthenticated && message.content && message.content.trim() !== '' && (
            <Tooltip title={detectedSpecialty ? `حجز موعد مع دكتور ${detectedSpecialty}` : "حجز موعد"}>
              <Button
                variant="contained"
                color="success"
                size="small"
                startIcon={<EventNoteIcon />}
                onClick={() => onBooking(message.content, detectedSpecialty)}
                sx={{ 
                  mt: 1, 
                  mb: 2,
                  background: theme => theme.palette.mode === 'dark' 
                    ? 'linear-gradient(135deg, #00BFA5 0%, #1DE9B6 100%)'
                    : 'linear-gradient(135deg, #00897B 0%, #26A69A 100%)',
                  '&:hover': {
                    background: theme => theme.palette.mode === 'dark'
                      ? 'linear-gradient(135deg, #00897B 0%, #00BFA5 100%)'
                      : 'linear-gradient(135deg, #00695C 0%, #00897B 100%)',
                  }
                }}
              >
                حجز
              </Button>
            </Tooltip>
          )}
        </Box>
      )}
    </Box>
  );
};

export default React.memo(ChatMessage);
