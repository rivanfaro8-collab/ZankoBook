import RoleGuideScreen, {
  type GuideSection,
} from '../../../components/guide/RoleGuideScreen'

const lecturerSections: GuideSection[] = [
  {
    icon: 'grid-outline',
    title: 'Getting Started',
    items: [
      {
        title: 'Open your dashboard',
        description: 'View the courses assigned to you and select a course to manage its content.',
      },
      {
        title: 'Know your lecturer role',
        description: 'Available editing actions depend on whether you are a primary, assistant, or lab lecturer.',
      },
    ],
  },
  {
    icon: 'layers-outline',
    title: 'Course Content',
    items: [
      {
        title: 'Organize course sections',
        description: 'Create or update sections so students can follow the course in a clear order.',
      },
      {
        title: 'Add learning materials',
        description: 'Upload files and resources, then confirm that titles and descriptions are clear.',
      },
      {
        title: 'Publish assignments',
        description: 'Add assignment details, set the relevant dates, and publish when it is ready for students.',
      },
    ],
  },
  {
    icon: 'checkmark-done-outline',
    title: 'Submissions, Grades & Attendance',
    items: [
      {
        title: 'Review submissions',
        description: 'Open an assignment to view student submissions and their uploaded work.',
      },
      {
        title: 'Record grades and feedback',
        description: 'Enter results carefully and publish them only when they are ready to be shown.',
      },
      {
        title: 'Manage attendance',
        description: 'Create attendance sessions and record student attendance for the selected course.',
      },
    ],
  },
  {
    icon: 'people-outline',
    title: 'Students & Requests',
    items: [
      {
        title: 'View enrolled students',
        description: 'Use the Students page inside a course to review the current class list.',
      },
      {
        title: 'Handle academic requests',
        description: 'Open Requests to review student submissions and respond according to your access.',
      },
    ],
  },
]

export default function LecturerGuide() {
  return (
    <RoleGuideScreen
      title='Lecturer Guide'
      intro='A focused overview of the tools used to manage courses and student activity.'
      sections={lecturerSections}
      tip='Before publishing content or grades, review the course, dates, files, and visibility settings one final time.'
    />
  )
}
