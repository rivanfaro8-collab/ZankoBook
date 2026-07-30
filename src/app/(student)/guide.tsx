import RoleGuideScreen, {
  type GuideSection,
} from '../../../components/guide/RoleGuideScreen'

const studentSections: GuideSection[] = [
  {
    icon: 'grid-outline',
    title: 'Getting Started',
    items: [
      {
        title: 'Choose courses when selection opens',
        description: 'Review available courses, select your choices, and send one request to your department for approval.',
      },
      {
        title: 'Open your dashboard',
        description: 'After course selection closes, view your enrolled courses and open a course to see its learning content.',
      },
      {
        title: 'Use the navigation tabs',
        description: 'Move quickly between Dashboard, Calendar, Requests, and Profile.',
      },
    ],
  },
  {
    icon: 'book-outline',
    title: 'Courses & Assignments',
    items: [
      {
        title: 'Review course sections',
        description: 'Open each section to read materials, view resources, and check assignments.',
      },
      {
        title: 'Submit your work',
        description: 'Open an assignment, attach the required file, and confirm that your submission was uploaded.',
      },
      {
        title: 'Check grades and feedback',
        description: 'Return to the course to review published grades and lecturer feedback.',
      },
    ],
  },
  {
    icon: 'calendar-outline',
    title: 'Calendar & Attendance',
    items: [
      {
        title: 'Follow upcoming events',
        description: 'Use the calendar to view course dates, deadlines, and scheduled activities.',
      },
      {
        title: 'Review attendance',
        description: 'Check your attendance information inside courses where attendance is available.',
      },
    ],
  },
  {
    icon: 'document-text-outline',
    title: 'Requests & Downloads',
    items: [
      {
        title: 'Send academic requests',
        description: 'Use Requests to create a new request and track its current status.',
      },
      {
        title: 'Find saved files',
        description: 'Downloaded course files are available from the side menu under Downloaded.',
      },
    ],
  },
]

export default function StudentGuide() {
  return (
    <RoleGuideScreen
      title='Student Guide'
      intro='A quick guide to the main tools you will use during your studies.'
      sections={studentSections}
      tip='Check your dashboard and calendar regularly so you do not miss newly added content, deadlines, or updates.'
    />
  )
}
