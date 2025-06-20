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
    lineHeight: 1.6,
    '& br': {
      display: 'block',
      marginBottom: theme.spacing(1),
      content: '""',
    }
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
    lineHeight: 1.6,
    '& br': {
      display: 'block',
      marginBottom: theme.spacing(1),
      content: '""',
    },
    '& span': {
      display: 'inline-block',
      margin: '4px 0',
      '&:contains("حالتك حرجة"), &:contains("حالتك غير حرجة")': {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(1),
      }
    }
  }
}));

const ChatMessage = ({ message, onBooking, userMessage = null }) => {
  const isUser = message.role === 'user';
  const isAuthenticated = authService.isAuthenticated();
  
  // Add a unique key for the component based on message ID and content
  const messageKey = useMemo(() => 
    `${message.id || message._id}-${message.content?.substring(0, 20) || ''}-${Date.now()}`, 
    [message.id, message._id, message.content]
  );
  // Format message content with proper line breaks and colored severity status
  const formatMessageContent = useMemo(() => {
    if (!message.content) return '';
    
    let formattedContent = message.content
      // Replace different types of line breaks with HTML br tags
      .replace(/\r\n/g, '<br>')
      .replace(/\n/g, '<br>')
      .replace(/\r/g, '<br>')
      // Replace literal <br> text with actual line breaks
      .replace(/&lt;br&gt;/g, '<br>')
      .replace(/&lt;br \/&gt;/g, '<br>')
      .replace(/&lt;br\/&gt;/g, '<br>')
      // Replace multiple consecutive <br> tags with double spacing
      .replace(/(<br>\s*){3,}/g, '<br><br>')      // Color the severity status with enhanced styling
      .replace(
        /(حالتك تستدعي طبيب)/g,
        '<br><br><span style="color: #d32f2f; font-weight: bold; background: rgba(211, 47, 47, 0.15); padding: 6px 12px; border-radius: 8px; border: 1px solid rgba(211, 47, 47, 0.3); margin: 8px 0; display: inline-block; box-shadow: 0 2px 4px rgba(211, 47, 47, 0.2);">⚠️ $1</span>'
      )
      .replace(
        /(حالتك غير حرجة)/g,
        '<br><br><span style="color: #388e3c; font-weight: bold; background: rgba(56, 142, 60, 0.15); padding: 6px 12px; border-radius: 8px; border: 1px solid rgba(56, 142, 60, 0.3); margin: 8px 0; display: inline-block; box-shadow: 0 2px 4px rgba(56, 142, 60, 0.2);">✅ $1</span>'
      );
    
    return formattedContent;
  }, [message.content]);
  // Extract specialty from message content using comprehensive keywords
  // Analyze both user and bot messages for better accuracy
  const detectedSpecialty = useMemo(() => {
    if (!isUser && message.content) {
      // Comprehensive medical specialty keywords in Arabic
      const specialtyKeywords = {
        "عظام": [
          // Basic terms
          "عظام", "عظم", "كسر", "كسور", "مفصل", "مفاصل", "التهاب المفاصل", 
          "الركبة", "الظهر", "آلام المفاصل", "هشاشة", "اصابة رياضية", "خشونة",
          // Extended terms
          "فقرات", "عمود فقري", "ديسك", "انزلاق غضروفي", "رقبة", "كتف", "كوع", 
          "رسغ", "يد", "أصابع", "فخذ", "ساق", "كاحل", "قدم", "أصابع القدم",
          "روماتيزم", "روماتويد", "التهاب العظام", "تآكل الغضاريف", "تيبس المفاصل",
          "ألم الظهر", "ألم الرقبة", "شد عضلي", "تمزق عضلي", "التواء", "خلع",
          "جبس", "جبيرة", "عكاز", "كرسي متحرك", "علاج طبيعي", "تأهيل"
        ],

        "قلب": [
          // Basic terms
          "قلب", "ضغط الدم", "الشريان", "نبض", "ذبحة", "صدرية", "جلطة", 
          "الشرايين", "الاوردة", "القلبية", "تصلب الشرايين", "خفقان",
          // Extended terms
          "أزمة قلبية", "نوبة قلبية", "احتشاء", "ذبحة صدرية", "ضيق تنفس",
          "تسارع نبضات", "بطء نبضات", "عدم انتظام النبض", "رجفان أذيني",
          "ضغط مرتفع", "ضغط منخفض", "كولسترول", "دهون الدم", "شحوم",
          "قسطرة", "دعامة", "جراحة القلب المفتوح", "تحويل مسار", "صمام القلب",
          "تضخم القلب", "ضعف عضلة القلب", "التهاب عضلة القلب", "التهاب التامور",
          "ألم في الصدر", "وخز في الصدر", "ضغطة على الصدر", "حرقة في الصدر"
        ],

        "جراحة": [
          // Basic terms
          "جراحة", "عملية", "استئصال", "شق", "جرح", "تدخل جراحي", "تخدير", 
          "فتح", "بنج", "عملية جراحية",
          // Extended terms
          "غرفة العمليات", "جراح", "مشرط", "خياطة", "غرز", "ضمادة", "شاش",
          "استئصال الزائدة", "استئصال المرارة", "استئصال الرحم", "استئصال الغدة الدرقية",
          "جراحة تجميلية", "جراحة ترميمية", "زراعة الأعضاء", "نقل الأعضاء",
          "منظار", "جراحة المناظير", "جراحة مفتوحة", "جراحة طفيفة التوغل",
          "ورم", "كتلة", "نمو غير طبيعي", "خراج", "كيس", "ناسور", "نزيف داخلي"
        ],

        "عيون": [
          // Basic terms
          "عيون", "عين", "نظر", "عدسة", "رؤية", "عمى", "قرنية", "شبكية", 
          "رمش", "جفن", "جفاف العين", "غشاء العين", "عدسة لاصقة", "نظارة",
          // Extended terms
          "ضعف النظر", "قصر النظر", "طول النظر", "الاستجماتيزم", "انحراف النظر",
          "المياه البيضاء", "الكتاراكت", "المياه الزرقاء", "الجلوكوما", "ضغط العين",
          "التهاب الملتحمة", "احمرار العين", "حكة في العين", "دموع", "إفرازات العين",
          "انفصال الشبكية", "نزيف في الشبكية", "اعتلال الشبكية السكري",
          "الحول", "ازدواج الرؤية", "زغللة", "عدم وضوح الرؤية", "هالات حول الأضواء",
          "عمى ليلي", "عمى الألوان", "فحص النظر", "قياس النظر"
        ],

        "أطفال": [
          // Basic terms
          "طفل", "أطفال", "الرضع", "رضيع", "الطفولة", "الحضانة", "مواليد", 
          "الرضاعة", "التطعيم", "الولادة", "مص", "اللعب", "بكاء",
          // Extended terms
          "حديث الولادة", "خديج", "مبتسر", "نمو الطفل", "تطور الطفل", "معالم النمو",
          "رضاعة طبيعية", "رضاعة صناعية", "فطام", "طعام الأطفال", "إمساك الأطفال",
          "إسهال الأطفال", "مغص الأطفال", "غازات", "تجشؤ", "قيء الأطفال",
          "حمى الأطفال", "سخونة", "تشنجات حرارية", "طفح الحفاض", "أكزيما الأطفال",
          "لقاحات", "تطعيمات", "جدول التطعيم", "حصبة", "جدري الماء", "نكاف",
          "تأخر النطق", "تأخر المشي", "فرط الحركة", "نقص الانتباه", "توحد"
        ],

        "جهاز هضمي": [
          // Basic terms
          "جهاز هضمي", "معدة", "أمعاء", "هضم", "قولون", "مرارة", "بنكرياس", 
          "قرحة معدية", "قيء", "حرقة", "مصران", "جشاء", "براز", "فضلات",
          // Extended terms
          "عسر الهضم", "سوء الهضم", "حموضة", "ارتجاع المريء", "حرقة المعدة",
          "غثيان", "استفراغ", "إسهال", "إمساك", "انتفاخ", "غازات", "مغص",
          "ألم في البطن", "تقلصات", "مريء", "اثني عشر", "أمعاء دقيقة", "أمعاء غليظة",
          "قولون عصبي", "التهاب القولون", "قرحة هضمية", "جرثومة المعدة", "هيليكوباكتر",
          "التهاب الكبد", "فيروس الكبد", "تليف الكبد", "حصوات المرارة", "التهاب المرارة",
          "التهاب البنكرياس", "إنزيمات الهضم", "عدم تحمل اللاكتوز", "حساسية الطعام",
          "فتق", "بواسير", "شرخ شرجي", "التهاب الزائدة الدودية"
        ],

        "جلدية": [
          // Basic terms
          "جلد", "طفح", "بشرة", "حساسية", "اكزيما", "حبوب", "صدفية", 
          "الاكزيما", "الجرب", "بثور", "حكة", "هرش", "احمرار", "جدري", "حساسية الجلد",
          // Extended terms
          "التهاب الجلد", "تهيج الجلد", "جفاف الجلد", "تشقق الجلد", "تقشر الجلد",
          "بقع جلدية", "تصبغات", "كلف", "نمش", "شامات", "وحمات", "ثآليل",
          "فطريات", "عدوى فطرية", "قوباء", "هربس", "زونا", "حزام النار",
          "تساقط الشعر", "صلع", "ثعلبة", "قشرة الرأس", "التهاب فروة الرأس",
          "أكزيما تأتبية", "التهاب الجلد التماسي", "شرى", "أرتيكاريا", "وذمة وعائية",
          "التهاب الأظافر", "فطريات الأظافر", "نمو الأظافر تحت الجلد", "اصفرار الأظافر",
          "حروق", "جروح", "ندبات", "التئام الجروح", "عدوى الجروح"
        ],

        "أسنان": [
          // Basic terms
          "أسنان", "سن", "ضرس", "لثة", "تسوس", "ألم الأسنان", "حشو", "تقويم", 
          "خلع", "طربوش", "جسر", "جذر", "ضرس العقل", "فرشاة أسنان", "معجون أسنان",
          // Extended terms
          "التهاب اللثة", "نزيف اللثة", "انتفاخ اللثة", "انحسار اللثة", "أمراض اللثة",
          "جير الأسنان", "بلاك", "تنظيف الأسنان", "تبييض الأسنان", "تلميع الأسنان",
          "عصب السن", "علاج العصب", "علاج الجذور", "خراج الأسنان", "التهاب العصب",
          "كسر في السن", "شرخ في السن", "حساسية الأسنان", "ألم عند الشرب البارد",
          "تقويم الأسنان", "تقويم معدني", "تقويم شفاف", "تقويم متحرك", "تقويم ثابت",
          "زراعة الأسنان", "غرسة", "طقم أسنان", "بروتيز", "فينير", "لومينير",
          "رائحة الفم", "جفاف الفم", "قرح الفم", "التهاب الفم"
        ],

        "نساء وتوليد": [
          // Basic terms
          "نساء", "توليد", "حمل", "ولادة", "رحم", "الطمث", "البلوغ", "الدورة", 
          "الدورة الشهرية", "المبيض", "انقطاع الطمث", "حيض", "تأخر الدورة", "إجهاض", "حامل",
          // Extended terms
          "حمل خارج الرحم", "حمل عنقودي", "نزيف الحمل", "غثيان الحمل", "وحام",
          "فحص الحمل", "سونار", "موجات فوق صوتية", "متابعة الحمل", "فحوصات الحمل",
          "ولادة طبيعية", "ولادة قيصرية", "طلق", "مخاض", "انقباضات", "كيس الماء",
          "الرضاعة الطبيعية", "لبن الأم", "احتقان الثدي", "التهاب الثدي", "شقوق الحلمة",
          "عدم انتظام الدورة", "دورة غزيرة", "دورة مؤلمة", "متلازمة ما قبل الحيض",
          "تكيس المبايض", "أورام ليفية", "التهاب المهبل", "إفرازات مهبلية", "حكة مهبلية",
          "سن اليأس", "أعراض انقطاع الطمث", "هبات حرارية", "جفاف المهبل",
          "منع الحمل", "حبوب منع الحمل", "لولب", "حقن منع الحمل", "تعقيم"
        ],

        "مخ واعصاب": [
          // Basic terms
          "مخ", "دماغ", "أعصاب", "عصبي", "صداع", "شقيقة", "ميغرانيا", "صرع", 
          "شلل", "تنميل", "رعشة", "دوخة", "دوار", "غيبوبة", "فقدان الوعي", "ارتجاج", "وخز",
          // Extended terms
          "الجهاز العصبي", "الأعصاب الطرفية", "العصب الوجهي", "شلل الوجه", "عصب سابع",
          "ضعف في الأطراف", "فقدان الإحساس", "خدر", "تنميل في اليد", "تنميل في القدم",
          "اضطراب النوم", "أرق", "نوم متقطع", "كوابيس", "سير أثناء النوم", "شخير",
          "فقدان الذاكرة", "نسيان", "ضعف التركيز", "تشتت الانتباه", "قلق", "اكتئاب",
          "نوبات صرع", "تشنجات", "رجفة", "باركنسون", "رعاش", "تيبس العضلات",
          "جلطة دماغية", "سكتة دماغية", "نزيف في المخ", "انسداد الشرايين المخية",
          "التهاب الأعصاب", "اعتلال الأعصاب", "عرق النسا", "انزلاق غضروفي عنقي",
          "صداع نصفي", "صداع توتري", "صداع عنقودي", "ألم عصبي"
        ],

        "أنف وأذن وحنجرة": [
          // Basic terms
          "أنف", "أذن", "حنجرة", "سمع", "سينوزيت", "لوز", "حلق", "الجيوب الأنفية", 
          "التهاب الأذن", "نزيف الأنف", "انسداد الانف", "طنين",
          // Extended terms
          "التهاب الجيوب الأنفية", "احتقان الأنف", "رشح", "زكام", "انفلونزا", "نزلة برد",
          "حساسية الأنف", "حمى القش", "عطس", "حكة في الأنف", "دموع", "رشح خلفي",
          "التهاب اللوزتين", "التهاب الحلق", "ألم في الحلق", "بحة الصوت", "فقدان الصوت",
          "التهاب الحنجرة", "التهاب الأحبال الصوتية", "تقرحات في الفم", "تقرحات الحلق",
          "ضعف السمع", "فقدان السمع", "صمم", "طنين الأذن", "رنين في الأذن", "وشوشة",
          "التهاب الأذن الوسطى", "التهاب الأذن الخارجية", "أذن السباح", "ألم الأذن",
          "إفرازات من الأذن", "صملاخ", "شمع الأذن", "انسداد الأذن", "ضغط في الأذن",
          "دوار", "دوخة", "اختلال التوازن", "غثيان من الدوار", "التهاب التيه"
        ],

        "مسالك بولية": [
          // Basic terms
          "مسالك بولية", "كلية", "كلى", "مثانة", "بول", "تبول", "حصوة", "حصوات", 
          "حرقان البول", "التهاب المثانة", "تكرار التبول", "بروستاتا", "حالب",
          // Extended terms
          "التهاب الكلى", "فشل كلوي", "قصور الكلى", "غسيل كلى", "زرع الكلى",
          "تضخم البروستاتا", "التهاب البروستاتا", "سرطان البروستاتا", "ضعف الانتصاب",
          "سلس البول", "عدم التحكم في البول", "تسرب البول", "احتباس البول", "صعوبة التبول",
          "ألم أثناء التبول", "حرقة في البول", "دم في البول", "بول دموي", "بول عكر",
          "كثرة التبول الليلي", "نيكتوريا", "عطش مفرط", "شرب الماء بكثرة", "جفاف",
          "عدوى المسالك البولية", "التهاب مجرى البول", "إفرازات من مجرى البول",
          "حصوات الكلى", "مغص كلوي", "ألم في الخاصرة", "ألم في أسفل البطن",
          "تحليل البول", "زراعة البول", "أشعة على الكلى", "منظار المثانة"
        ],

        "غدد صماء": [
          // Basic terms
          "غدد صماء", "سكري", "سكر", "هرمون", "هرمونات", "درقية", "الغدة الدرقية", 
          "أنسولين", "غدة", "ارتفاع السكر", "انخفاض السكر", "بلوغ مبكر", "هرمون النمو",
          // Extended terms
          "داء السكري", "السكري النوع الأول", "السكري النوع الثاني", "سكري الحمل",
          "مقاومة الأنسولين", "متلازمة الأيض", "جلوكوز", "فحص السكر", "سكر تراكمي",
          "فرط نشاط الغدة الدرقية", "قصور الغدة الدرقية", "تضخم الغدة الدرقية", "جحوظ العينين",
          "خمول الغدة الدرقية", "نشاط زائد في الغدة الدرقية", "عقد درقية", "أورام الغدة الدرقية",
          "الغدد الكظرية", "فرط كورتيزول", "مرض أديسون", "قصور الكظر", "متلازمة كوشينغ",
          "الغدة النخامية", "هرمون النمو", "قصر القامة", "طول القامة المفرط", "عملقة",
          "هرمونات التكاثر", "تأخر البلوغ", "بلوغ مبكر", "اضطرابات الدورة الشهرية",
          "هرمون الحليب", "برولاكتين", "هرمون الذكورة", "تستوستيرون", "هرمون الأنوثة", "استروجين"
        ],

        "طب نفسي": [
          // Basic terms
          "طب نفسي", "نفسي", "اكتئاب", "قلق", "توتر", "وسواس", "اضطراب", 
          "رهاب", "خوف", "هلع", "انطواء", "عزلة", "تعب نفسي", "أفكار سلبية",
          // Extended terms
          "اضطراب المزاج", "ثنائي القطب", "هوس", "نوبات الهلع", "رهاب اجتماعي",
          "اضطراب الوسواس القهري", "وساوس", "أفعال قهرية", "طقوس", "تكرار الأفعال",
          "اضطراب ما بعد الصدمة", "صدمة نفسية", "كوابيس", "ذكريات مؤلمة", "فلاش باك",
          "اضطراب الشخصية", "شخصية حدية", "عدم الاستقرار العاطفي", "تقلبات مزاجية",
          "فقدان الشهية", "الشراهة", "اضطرابات الأكل", "صورة الجسم", "وزن", "حمية قاسية",
          "إدمان", "تعاطي المواد", "كحول", "مخدرات", "التدخين", "إقلاع عن التدخين",
          "أرق", "اضطرابات النوم", "كوابيس", "نوم متقطع", "استيقاظ مبكر", "نعاس مفرط",
          "تشتت الانتباه", "فرط الحركة", "نقص التركيز", "صعوبة التعلم", "ذاكرة ضعيفة",
          "أفكار انتحارية", "إيذاء الذات", "عدوانية", "غضب", "عنف", "سلوك مدمر"
        ],

        "باطنة": [
          // General internal medicine terms
          "حمى", "سخونة", "حرارة", "تعب", "إرهاق", "ضعف عام", "فقدان الوزن", "زيادة الوزن",
          "فقدان الشهية", "غثيان", "دوخة", "صداع عام", "ألم عام", "التهاب", "عدوى",
          "مناعة ضعيفة", "نزلات برد متكررة", "تعرق ليلي", "قشعريرة", "رعشة",
          "ضغط الدم", "كولسترول", "فيتامينات", "أنيميا", "فقر الدم", "نقص الحديد",
          "فحوصات دورية", "تحاليل عامة", "فحص شامل", "متابعة طبية", "أدوية مزمنة"
        ]
      };

      // Combine user message and bot message for analysis, prioritizing user message
      let combinedContent = '';
      if (userMessage && userMessage.content) {
        combinedContent = userMessage.content.toLowerCase() + ' ';
      }
      combinedContent += message.content.toLowerCase();
      
      console.log("Analyzing combined content for specialty detection:", combinedContent);
      
      // Track all matching specialties with their match count
      const specialtyMatches = {};
      
      // Check for specialty keywords
      for (const [specialty, keywords] of Object.entries(specialtyKeywords)) {
        const matchCount = keywords.filter(keyword => combinedContent.includes(keyword)).length;
        if (matchCount > 0) {
          specialtyMatches[specialty] = matchCount;
        }
      }

      // If we have matches, return the specialty with the highest match count
      if (Object.keys(specialtyMatches).length > 0) {
        const bestMatch = Object.entries(specialtyMatches)
          .sort(([,a], [,b]) => b - a)[0][0];
        console.log(`Detected specialty: ${bestMatch} with ${specialtyMatches[bestMatch]} matches`);
        console.log('All matches:', specialtyMatches);
        return bestMatch;
      }

      console.log("No specialty detected, defaulting to باطنة");
      return "باطنة";
    }
    return null;
  }, [isUser, message.content, userMessage]);

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
          <Typography 
            variant="body1" 
            dangerouslySetInnerHTML={{ __html: formatMessageContent }}
          />
        </UserMessagePaper>
      ) : (
        <Box sx={{ maxWidth: '70%' }}>
          <BotMessagePaper>
            <Typography 
              variant="body1" 
              dangerouslySetInnerHTML={{ __html: formatMessageContent }}
            />
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
