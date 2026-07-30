import * as SecureStore from 'expo-secure-store'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

export const SUPPORTED_LANGUAGES = ['en', 'ar', 'ckb'] as const
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number]

const LANGUAGE_KEY = 'zankobook-language'

const ar: Record<string, string> = {
  'English': 'الإنجليزية', 'Arabic': 'العربية', 'Kurdish (Central)': 'الكردية (السورانية)',
  'Open menu': 'فتح القائمة', 'Toggle dark mode': 'تبديل الوضع الداكن', 'Choose language': 'اختيار اللغة',
  'Student': 'طالب', 'Lecturer': 'محاضر', 'Dashboard': 'لوحة التحكم', 'My Courses': 'مقرراتي',
  'Calendar': 'التقويم', 'Profile': 'الملف الشخصي', 'Requests': 'الطلبات', 'Downloaded': 'التنزيلات',
  'Help / Guide': 'المساعدة / الدليل', 'Themes': 'السمات', 'Logout': 'تسجيل الخروج', 'Logging out...': 'جارٍ تسجيل الخروج...',
  'Login': 'تسجيل الدخول', 'Email': 'البريد الإلكتروني', 'Email address': 'عنوان البريد الإلكتروني', 'Password': 'كلمة المرور',
  'Forgot password?': 'هل نسيت كلمة المرور؟', 'Back to Login': 'العودة لتسجيل الدخول', 'Change Password': 'تغيير كلمة المرور',
  'Current password': 'كلمة المرور الحالية', 'New password': 'كلمة المرور الجديدة', 'Confirm new password': 'تأكيد كلمة المرور الجديدة',
  'Confirm': 'تأكيد', 'Save changes': 'حفظ التغييرات', 'Retry': 'إعادة المحاولة', 'Try again': 'حاول مرة أخرى',
  'Loading your courses...': 'جارٍ تحميل مقرراتك...', 'Courses could not be loaded': 'تعذر تحميل المقررات',
  'Your assigned courses will appear here.': 'ستظهر مقرراتك المسندة هنا.', 'No courses yet': 'لا توجد مقررات بعد',
  'No courses available': 'لا توجد مقررات متاحة', 'Pin important courses to keep them at the top.': 'ثبّت المقررات المهمة لإبقائها في الأعلى.',
  'Overview': 'نظرة عامة', 'Course teachers': 'مدرسو المقرر', 'Students': 'الطلاب', 'Course Selection': 'اختيار المقررات',
  'Enrollment': 'التسجيل', 'Review your selection': 'راجع اختيارك', 'Review request': 'مراجعة الطلب', 'Send request': 'إرسال الطلب',
  'Request sent': 'تم إرسال الطلب', 'Available courses': 'المقررات المتاحة', 'Mandatory': 'إلزامي', 'Elective': 'اختياري',
  'selected': 'محدد', 'Department': 'القسم', 'Faculty': 'الكلية', 'University': 'الجامعة', 'Role': 'الدور',
  'Choose your courses for this semester and send them to the department for approval.': 'اختر مقررات هذا الفصل وأرسلها إلى القسم للموافقة.',
  'Confirm the courses you want to send to your department.': 'أكد المقررات التي تريد إرسالها إلى قسمك.',
  'No courses are currently open for selection.': 'لا توجد مقررات مفتوحة للاختيار حالياً.',
  'Enrollment could not be loaded': 'تعذر تحميل التسجيل', 'Loading available courses...': 'جارٍ تحميل المقررات المتاحة...',
  'Attendance': 'الحضور', 'ATTENDANCE RATE': 'نسبة الحضور', 'Add attendance session': 'إضافة جلسة حضور',
  'Session title': 'عنوان الجلسة', 'Session date': 'تاريخ الجلسة', 'Start time': 'وقت البدء', 'End time': 'وقت الانتهاء',
  'All present': 'الجميع حاضر', 'Session record': 'سجل الجلسة', 'No sessions found': 'لم يتم العثور على جلسات',
  'No sessions yet. Create the first one.': 'لا توجد جلسات بعد. أنشئ الجلسة الأولى.', 'Loading your attendance…': 'جارٍ تحميل الحضور…',
  'Could not load attendance': 'تعذر تحميل الحضور', 'Present': 'حاضر', 'Absent': 'غائب', 'Late': 'متأخر', 'Excused': 'بعذر',
  'Grades': 'الدرجات', 'Not graded': 'غير مُقيّم', 'No grades yet': 'لا توجد درجات بعد', 'Loading your grades...': 'جارٍ تحميل درجاتك...',
  'Could not load grades': 'تعذر تحميل الدرجات', 'Assessment results': 'نتائج التقييم', 'TOTAL SCORE': 'المجموع الكلي', 'YOUR TOTAL': 'مجموعك',
  'Activities & weights': 'الأنشطة والأوزان', 'Edit activities': 'تعديل الأنشطة', 'Add activity': 'إضافة نشاط', 'Delete activity': 'حذف النشاط',
  'Activity name': 'اسم النشاط', 'Activity title': 'عنوان النشاط', 'Weight': 'الوزن', 'Maximum mark': 'الدرجة القصوى',
  'Save marks': 'حفظ الدرجات', 'Send marks to department': 'إرسال الدرجات إلى القسم', 'Marks sent': 'تم إرسال الدرجات',
  'Save your mark changes before sending.': 'احفظ تغييرات الدرجات قبل الإرسال.',
  'Publishes the course assessments and sends the marks to your department in e-Zanko.': 'ينشر تقييمات المقرر ويرسل الدرجات إلى قسمك في e-Zanko.',
  'Course content': 'محتوى المقرر', 'Add section': 'إضافة قسم', 'Section title': 'عنوان القسم', 'No sections yet': 'لا توجد أقسام بعد',
  'Loading course content…': 'جارٍ تحميل محتوى المقرر…', 'Could not load content': 'تعذر تحميل المحتوى', 'Assignments': 'الواجبات',
  'Assignment details': 'تفاصيل الواجب', 'Your submission': 'تسليمك', 'Submit': 'تسليم', 'Attachments': 'المرفقات', 'Description': 'الوصف',
  'View submissions': 'عرض التسليمات', 'Student submissions': 'تسليمات الطلاب', 'No files submitted yet.': 'لم يتم تسليم ملفات بعد.',
  'No attachments.': 'لا توجد مرفقات.', 'No attachments uploaded.': 'لم يتم رفع مرفقات.', 'Upload item': 'رفع عنصر', 'Title *': 'العنوان *',
  'URL *': 'الرابط *', 'Description (optional)': 'الوصف (اختياري)', 'Due time *': 'وقت الاستحقاق *', 'Maximum mark *': 'الدرجة القصوى *',
  'Weight *': 'الوزن *', 'Files you download will appear here.': 'ستظهر الملفات التي تنزلها هنا.', 'No downloaded files': 'لا توجد ملفات منزلة',
  'Recently Downloaded': 'تم تنزيله مؤخراً', 'Loading your files…': 'جارٍ تحميل ملفاتك…', 'Could not load your files. Try again': 'تعذر تحميل ملفاتك. حاول مرة أخرى',
  'Offline mode — showing saved data': 'وضع عدم الاتصال — عرض البيانات المحفوظة', 'Online connection required.': 'يتطلب اتصالاً بالإنترنت.',
  'New request': 'طلب جديد', 'Subject': 'الموضوع', 'Short summary': 'ملخص قصير', 'Describe your request...': 'صف طلبك...',
  'Requests are forwarded to your department in e-Zanko.': 'يتم تحويل الطلبات إلى قسمك في e-Zanko.', 'No requests yet': 'لا توجد طلبات بعد',
  'Loading requests...': 'جارٍ تحميل الطلبات...', 'Could not load requests': 'تعذر تحميل الطلبات', 'Send': 'إرسال',
  'No events this month': 'لا توجد أحداث هذا الشهر', 'Could not load calendar': 'تعذر تحميل التقويم',
  'Name': 'الاسم', 'Phone': 'الهاتف', 'Student no.': 'رقم الطالب', 'Joined': 'تاريخ الانضمام', 'Stage': 'المرحلة',
  'Guide': 'الدليل', 'Getting started': 'البدء', 'Downloads': 'التنزيلات', 'Course pages': 'صفحات المقررات',
  'Loading…': 'جارٍ التحميل…', 'Cancel': 'إلغاء', 'Delete': 'حذف', 'Edit': 'تعديل', 'Open': 'فتح', 'New': 'جديد',
  'Type': 'النوع', 'Title': 'العنوان', 'Hour': 'الساعة', 'Minute': 'الدقيقة', 'Select today': 'اختيار اليوم',
  'Discard changes': 'تجاهل التغييرات', 'No assessments yet': 'لا توجد تقييمات بعد', 'Add assessment': 'إضافة تقييم',
  'Tap any cell to enter a mark': 'اضغط على أي خلية لإدخال درجة', 'Lecturer feedback': 'ملاحظات المحاضر',
}

const ckb: Record<string, string> = {
  'English': 'ئینگلیزی', 'Arabic': 'عەرەبی', 'Kurdish (Central)': 'کوردی (سۆرانی)',
  'Open menu': 'کردنەوەی لیست', 'Toggle dark mode': 'گۆڕینی دۆخی تاریک', 'Choose language': 'هەڵبژاردنی زمان',
  'Student': 'خوێندکار', 'Lecturer': 'مامۆستا', 'Dashboard': 'داشبۆرد', 'My Courses': 'کۆرسەکانم',
  'Calendar': 'ڕۆژژمێر', 'Profile': 'پرۆفایل', 'Requests': 'داواکارییەکان', 'Downloaded': 'داگیراوەکان',
  'Help / Guide': 'یارمەتی / ڕێبەر', 'Themes': 'ڕووکارەکان', 'Logout': 'چوونەدەرەوە', 'Logging out...': 'لە چوونەدەرەوەدایە...',
  'Login': 'چوونەژوورەوە', 'Email': 'ئیمەیڵ', 'Email address': 'ناونیشانی ئیمەیڵ', 'Password': 'وشەی نهێنی',
  'Forgot password?': 'وشەی نهێنیت لەبیرچووە؟', 'Back to Login': 'گەڕانەوە بۆ چوونەژوورەوە', 'Change Password': 'گۆڕینی وشەی نهێنی',
  'Current password': 'وشەی نهێنی ئێستا', 'New password': 'وشەی نهێنی نوێ', 'Confirm new password': 'دڵنیابوونەوە لە وشەی نهێنی نوێ',
  'Confirm': 'دڵنیابوونەوە', 'Save changes': 'پاشەکەوتکردنی گۆڕانکارییەکان', 'Retry': 'هەوڵدانەوە', 'Try again': 'دووبارە هەوڵبدە',
  'Loading your courses...': 'کۆرسەکانت بار دەکرێن...', 'Courses could not be loaded': 'نەتوانرا کۆرسەکان بار بکرێن',
  'Your assigned courses will appear here.': 'کۆرسە دیاریکراوەکانت لێرە دەردەکەون.', 'No courses yet': 'هێشتا کۆرس نییە',
  'No courses available': 'هیچ کۆرسێک بەردەست نییە', 'Pin important courses to keep them at the top.': 'کۆرسە گرنگەکان بچەسپێنە بۆ ئەوەی لە سەرەوە بمێننەوە.',
  'Overview': 'پوختە', 'Course teachers': 'مامۆستاکانی کۆرس', 'Students': 'خوێندکاران', 'Course Selection': 'هەڵبژاردنی کۆرس',
  'Enrollment': 'تۆمارکردن', 'Review your selection': 'هەڵبژاردنەکەت بپشکنە', 'Review request': 'پشکنینی داواکاری', 'Send request': 'ناردنی داواکاری',
  'Request sent': 'داواکاری نێردرا', 'Available courses': 'کۆرسە بەردەستەکان', 'Mandatory': 'ناچاری', 'Elective': 'هەڵبژاردەیی',
  'selected': 'هەڵبژێردراو', 'Department': 'بەش', 'Faculty': 'کۆلێژ', 'University': 'زانکۆ', 'Role': 'ڕۆڵ',
  'Choose your courses for this semester and send them to the department for approval.': 'کۆرسەکانی ئەم وەرزە هەڵبژێرە و بۆ پەسەندکردن بۆ بەش بنێرە.',
  'Confirm the courses you want to send to your department.': 'کۆرسەکان دڵنیابکەرەوە کە دەتەوێت بۆ بەشەکەت بنێریت.',
  'No courses are currently open for selection.': 'لە ئێستادا هیچ کۆرسێک بۆ هەڵبژاردن کراوە نییە.',
  'Enrollment could not be loaded': 'نەتوانرا تۆمارکردن بار بکرێت', 'Loading available courses...': 'کۆرسە بەردەستەکان بار دەکرێن...',
  'Attendance': 'ئامادەبوون', 'ATTENDANCE RATE': 'ڕێژەی ئامادەبوون', 'Add attendance session': 'زیادکردنی دانیشتنی ئامادەبوون',
  'Session title': 'ناونیشانی دانیشتن', 'Session date': 'بەرواری دانیشتن', 'Start time': 'کاتی دەستپێک', 'End time': 'کاتی کۆتایی',
  'All present': 'هەموو ئامادەن', 'Session record': 'تۆماری دانیشتن', 'No sessions found': 'هیچ دانیشتنێک نەدۆزرایەوە',
  'No sessions yet. Create the first one.': 'هێشتا دانیشتن نییە. یەکەم دانیشتن دروست بکە.', 'Loading your attendance…': 'ئامادەبوونت بار دەکرێت…',
  'Could not load attendance': 'نەتوانرا ئامادەبوون بار بکرێت', 'Present': 'ئامادە', 'Absent': 'نەهاتوو', 'Late': 'دواکەوتوو', 'Excused': 'بە بیانوو',
  'Grades': 'نمرەکان', 'Not graded': 'نمرە نەدراوە', 'No grades yet': 'هێشتا نمرە نییە', 'Loading your grades...': 'نمرەکانت بار دەکرێن...',
  'Could not load grades': 'نەتوانرا نمرەکان بار بکرێن', 'Assessment results': 'ئەنجامی هەڵسەنگاندن', 'TOTAL SCORE': 'کۆی نمرە', 'YOUR TOTAL': 'کۆی نمرەی تۆ',
  'Activities & weights': 'چالاکی و کێشەکان', 'Edit activities': 'دەستکاریکردنی چالاکییەکان', 'Add activity': 'زیادکردنی چالاکی', 'Delete activity': 'سڕینەوەی چالاکی',
  'Activity name': 'ناوی چالاکی', 'Activity title': 'ناونیشانی چالاکی', 'Weight': 'کێش', 'Maximum mark': 'زۆرترین نمرە',
  'Save marks': 'پاشەکەوتکردنی نمرەکان', 'Send marks to department': 'ناردنی نمرەکان بۆ بەش', 'Marks sent': 'نمرەکان نێردران',
  'Save your mark changes before sending.': 'پێش ناردن گۆڕانکاریی نمرەکان پاشەکەوت بکە.',
  'Publishes the course assessments and sends the marks to your department in e-Zanko.': 'هەڵسەنگاندنەکانی کۆرس بڵاودەکاتەوە و نمرەکان بۆ بەشەکەت لە e-Zanko دەنێرێت.',
  'Course content': 'ناوەڕۆکی کۆرس', 'Add section': 'زیادکردنی بەش', 'Section title': 'ناونیشانی بەش', 'No sections yet': 'هێشتا بەش نییە',
  'Loading course content…': 'ناوەڕۆکی کۆرس بار دەکرێت…', 'Could not load content': 'نەتوانرا ناوەڕۆک بار بکرێت', 'Assignments': 'ئەرکەکان',
  'Assignment details': 'وردەکاریی ئەرک', 'Your submission': 'تسلیمکردنی تۆ', 'Submit': 'تسلیمکردن', 'Attachments': 'پاشکۆکان', 'Description': 'وەسف',
  'View submissions': 'بینینی تسلیمکراوەکان', 'Student submissions': 'تسلیمکراوەکانی خوێندکاران', 'No files submitted yet.': 'هێشتا هیچ فایلێک تسلیم نەکراوە.',
  'No attachments.': 'پاشکۆ نییە.', 'No attachments uploaded.': 'هیچ پاشکۆیەک بار نەکراوە.', 'Upload item': 'بارکردنی بابەت', 'Title *': 'ناونیشان *',
  'URL *': 'بەستەر *', 'Description (optional)': 'وەسف (ئارەزوومەندانە)', 'Due time *': 'کاتی دوا *', 'Maximum mark *': 'زۆرترین نمرە *',
  'Weight *': 'کێش *', 'Files you download will appear here.': 'فایلە داگیراوەکانت لێرە دەردەکەون.', 'No downloaded files': 'هیچ فایلێک دانەگیراوە',
  'Recently Downloaded': 'بەم دواییە داگیراوە', 'Loading your files…': 'فایلەکانت بار دەکرێن…', 'Could not load your files. Try again': 'نەتوانرا فایلەکانت بار بکرێن. دووبارە هەوڵبدە',
  'Offline mode — showing saved data': 'دۆخی ئۆفلاین — داتای پاشەکەوتکراو پیشان دەدرێت', 'Online connection required.': 'پێویستی بە پەیوەندی ئینتەرنێت هەیە.',
  'New request': 'داواکاری نوێ', 'Subject': 'بابەت', 'Short summary': 'پوختەی کورت', 'Describe your request...': 'داواکارییەکەت وەسف بکە...',
  'Requests are forwarded to your department in e-Zanko.': 'داواکارییەکان لە e-Zanko بۆ بەشەکەت دەنێردرێن.', 'No requests yet': 'هێشتا داواکاری نییە',
  'Loading requests...': 'داواکارییەکان بار دەکرێن...', 'Could not load requests': 'نەتوانرا داواکارییەکان بار بکرێن', 'Send': 'ناردن',
  'No events this month': 'لەم مانگەدا ڕووداو نییە', 'Could not load calendar': 'نەتوانرا ڕۆژژمێر بار بکرێت',
  'Name': 'ناو', 'Phone': 'تەلەفۆن', 'Student no.': 'ژمارەی خوێندکار', 'Joined': 'بەشداری', 'Stage': 'قۆناغ',
  'Guide': 'ڕێبەر', 'Getting started': 'دەستپێکردن', 'Downloads': 'داگرتنەکان', 'Course pages': 'پەڕەکانی کۆرس',
  'Loading…': 'بار دەکرێت…', 'Cancel': 'پاشگەزبوونەوە', 'Delete': 'سڕینەوە', 'Edit': 'دەستکاری', 'Open': 'کردنەوە', 'New': 'نوێ',
  'Type': 'جۆر', 'Title': 'ناونیشان', 'Hour': 'کاتژمێر', 'Minute': 'خولەک', 'Select today': 'ئەمڕۆ هەڵبژێرە',
  'Discard changes': 'فڕێدانی گۆڕانکارییەکان', 'No assessments yet': 'هێشتا هەڵسەنگاندن نییە', 'Add assessment': 'زیادکردنی هەڵسەنگاندن',
  'Tap any cell to enter a mark': 'بۆ نووسینی نمرە لە هەر خانەیەک بدە', 'Lecturer feedback': 'تێبینی مامۆستا',
}

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: { translation: {} },
    ar: { translation: ar },
    ckb: { translation: ckb },
  },
  interpolation: { escapeValue: false },
  returnNull: false,
})

export async function loadSavedLanguage(): Promise<AppLanguage> {
  try {
    const saved = await SecureStore.getItemAsync(LANGUAGE_KEY)
    if (saved && SUPPORTED_LANGUAGES.includes(saved as AppLanguage)) {
      await i18n.changeLanguage(saved)
      return saved as AppLanguage
    }
  } catch {
    // Keep English when secure storage is unavailable.
  }
  return 'en'
}

export async function setAppLanguage(language: AppLanguage): Promise<void> {
  await i18n.changeLanguage(language)
  try {
    await SecureStore.setItemAsync(LANGUAGE_KEY, language)
  } catch {
    // Language still changes for the current session.
  }
}

export function translateLiteral(value: string): string {
  return i18n.t(value, { defaultValue: value })
}

export default i18n
