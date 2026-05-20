import {
  LuBadgeCheck,
  LuFileText,
  LuShieldCheck,
  LuHandshake,
  LuClipboardList,
  LuSearch,
  LuSend,
  LuWallet,
} from 'react-icons/lu';

export const BENEFITS = [
  {
    icon: LuBadgeCheck,
    title: 'רואה חשבון מוסמך',
    desc: 'בוגר קורס החזרי מס של לשכת רואי חשבון — מומחיות אמיתית ומוסמכת בהחזרי מס',
  },
  {
    icon: LuFileText,
    title: 'ללא איסוף מסמכים',
    desc: 'אין שום עבודה מצדכם! אנחנו אוספים ומטפלים בכל המסמכים מול רשות המסים',
  },
  {
    icon: LuShieldCheck,
    title: 'ללא סיכון',
    desc: 'אם לא נמצא החזר  - לא משלמים!',
  },
  {
    icon: LuHandshake,
    title: 'אנחנו עושים הכל',
    desc: 'מהבדיקה הראשונית ועד העברת הכסף לחשבון — הצוות שלנו מטפל בהכל בשבילכם',
  },
];

export const PROCESS_STEPS = [
  {
    num: '01',
    title: 'ממלאים שאלון קצר',
    desc: 'ענו על מספר שאלות פשוטות — זה הכל מהצד שלכם!',
    icon: LuClipboardList,
  },
  {
    num: '02',
    title: 'אנחנו בודקים ומכינים הכל',
    desc: 'הרואה חשבון המוסמך שלנו בודק, אוסף מסמכים ומחשב את ההחזר — ללא כל מאמץ מצדכם',
    icon: LuSearch,
  },
  {
    num: '03',
    title: 'אנחנו מגישים',
    desc: 'מגישים את הבקשה מול רשות המסים בשמכם — אין צורך לעשות דבר!',
    icon: LuSend,
  },
  {
    num: '04',
    title: 'כסף בחשבון!',
    desc: 'ההחזר מועבר ישירות לחשבון הבנק שלכם',
    icon: LuWallet,
  },
];
