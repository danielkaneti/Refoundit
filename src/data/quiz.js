import {
  LuBriefcase,
  LuHourglass,
  LuCalendarDays,
  LuLandmark,
  LuMedal,
  LuGraduationCap,
  LuStar,
  LuTrendingUp,
  LuHeart,
  LuUser,
  LuWallet,
  LuBaby,
  LuHeartPulse,
  LuShieldCheck,
  LuUsers,
  LuAccessibility,
  LuPlane,
  LuHouse,
} from 'react-icons/lu';

export const QUIZ_STEP1 = [
  { id: 'job_change', icon: LuBriefcase, label: 'החלפתי מקום עבודה' },
  { id: 'unemployment', icon: LuHourglass, label: 'קיבלתי דמי אבטלה' },
  { id: 'partial_year', icon: LuCalendarDays, label: 'לא עבדתי חלק מהשנה' },
  { id: 'pension_withdrawal', icon: LuLandmark, label: 'משכתי קרן פנסיה או פיצויים' },
  { id: 'army_discharge', icon: LuMedal, label: 'השתחררתי מצה"ל' },
  { id: 'degree', icon: LuGraduationCap, label: 'סיימתי תואר' },
  { id: 'reserves', icon: LuStar, label: 'עשיתי מילואים' },
  { id: 'stocks', icon: LuTrendingUp, label: 'סחרתי בשוק ההון' },
  { id: 'donation', icon: LuHeart, label: 'תרמתי לעמותה' },
];

export const QUIZ_STEP2 = [
  { id: 'single_parent', icon: LuUser, label: 'אני חד הורי/ת' },
  { id: 'alimony', icon: LuWallet, label: 'שילמתי מזונות' },
  { id: 'maternity', icon: LuBaby, label: 'קיבלתי דמי לידה' },
  { id: 'disabled_child', icon: LuHeartPulse, label: 'יש לי ילד נטול יכולת' },
  { id: 'life_insurance', icon: LuShieldCheck, label: 'אני משלמ/ת ביטוח חיים' },
  { id: 'kids_under_18', icon: LuUsers, label: 'יש לי ילדים מתחת לגיל 18' },
  { id: 'disability', icon: LuAccessibility, label: 'יש לי נכות רפואית' },
  { id: 'immigration', icon: LuPlane, label: 'עליתי לארץ' },
  { id: 'settlement', icon: LuHouse, label: 'התגוררתי ביישוב מוטב' },
];

export const REASONS = [
  'שחרור מצה״ל', 'סחר בשוק ההון', 'מגורים בישוב מוטב',
  'נכות רפואית', 'עלייה לארץ', 'הולדת ילדים',
  'סיום תואר', 'שירות מילואים', 'תרומה לעמותות',
  'הורות יחידנית', 'תשלום מזונות', 'החלפת מקום עבודה',
  'דמי אבטלה', 'ביטוח חיים / משכנתא', 'דמי לידה',
];
