import { Pressable, StyleSheet, View } from 'react-native'

import { useAppTheme } from '../../src/store/themeStore'
import type {
  AttendanceStatus,
  CourseStudent,
} from '../../src/types/attendance'
import ThemedText from '../ThemedText'

const options: Array<{
  key: AttendanceStatus
  label: string
  activeColor: string
}> = [
  { key: 'Present', label: 'P', activeColor: '#0F9D8A' },
  { key: 'Absent', label: 'A', activeColor: '#E05252' },
  { key: 'Late', label: 'L', activeColor: '#D99218' },
  { key: 'Excused Absence', label: 'E', activeColor: '#778292' },
]

type Props = {
  student: CourseStudent
  status?: AttendanceStatus
  onStatusChange: (studentId: number, status: AttendanceStatus) => void
  disabled?: boolean
}

export default function StudentAttendanceRow({
  student,
  status,
  onStatusChange,
  disabled = false,
}: Props) {
  const theme = useAppTheme()

  return (
    <View style={[styles.row, { borderBottomColor: theme.border }]}>
      <ThemedText title style={styles.name} numberOfLines={2}>
        {student.user.name}
      </ThemedText>

      <View style={styles.options}>
        {options.map((option) => {
          const active = status === option.key

          return (
            <Pressable
              key={option.key}
              accessibilityRole='button'
              accessibilityLabel={`${student.user.name}: ${option.key}`}
              accessibilityState={{ selected: active, disabled }}
              disabled={disabled}
              onPress={() => onStatusChange(student.id, option.key)}
              style={({ pressed }) => [
                styles.statusButton,
                {
                  backgroundColor: active
                    ? option.activeColor
                    : theme.background,
                  borderColor: active ? option.activeColor : theme.border,
                  opacity: disabled ? 0.45 : pressed ? 0.72 : 1,
                },
              ]}
            >
              <ThemedText
                title
                style={{
                  color: active ? '#FFFFFF' : theme.text,
                  fontSize: 14,
                }}
              >
                {option.label}
              </ThemedText>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    minHeight: 68,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  name: {
    flex: 1,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '700',
  },
  options: {
    flexDirection: 'row',
    gap: 7,
  },
  statusButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
