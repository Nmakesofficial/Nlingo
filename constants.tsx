import React from 'react';
import { View } from './types';
import { MicrophoneIcon, TextBubbleIcon, ClipboardCheckIcon, RoadmapIcon } from './components/Icons';

export const LANGUAGES = [
  { value: 'Arabic', label: 'العربية' },
  { value: 'English', label: 'الإنجليزية' },
  { value: 'Spanish', label: 'الإسبانية' },
  { value: 'French', label: 'الفرنسية' },
  { value: 'Korean', label: 'الكورية' },
  { value: 'Japanese', label: 'اليابانية' },
  { value: 'Turkish', label: 'التركية' },
];

export const TARGET_LANGUAGES = [
  { value: 'English', label: 'الإنجليزية' },
  { value: 'Spanish', label: 'الإسبانية' },
  { value: 'French', label: 'الفرنسية' },
  { value: 'German', label: 'الألمانية' },
  { value: 'Korean', label: 'الكورية' },
  { value: 'Japanese', label: 'اليابانية' },
  { value: 'Turkish', label: 'التركية' },
];

export const LEVELS = [
  { value: 'Beginner', label: 'مبتدئ' },
  { value: 'Intermediate', label: 'متوسط' },
  { value: 'Advanced', label: 'متقدم' },
];


export const NAV_ITEMS = [
  {
    id: 'voice-chat',
    label: 'محادثة صوتية',
    shortLabel: 'صوتية',
    icon: MicrophoneIcon,
    view: View.VOICE_CHAT,
  },
  {
    id: 'text-chat',
    label: 'محادثة نصية',
    shortLabel: 'نصية',
    icon: TextBubbleIcon,
    view: View.TEXT_CHAT,
  },
  {
    id: 'quizzes',
    label: 'اختبارات',
    shortLabel: 'اختبارات',
    icon: ClipboardCheckIcon,
    view: View.QUIZZES,
  },
  {
    id: 'roadmap',
    label: 'خارطة الطريق',
    shortLabel: 'الخارطة',
    icon: RoadmapIcon,
    view: View.ROADMAP,
  },
];
