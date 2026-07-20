import { Ionicons } from '@expo/vector-icons'
import * as Linking from 'expo-linking'
import { Alert, Pressable, StyleSheet, View } from 'react-native'

import { useAppTheme } from '@/store/themeStore'
import type {
  AcademicRequest,
  AcademicRequestStatus,
} from '@/types/academicRequests'
import ThemedText from '../ThemedText'

const TYPE_LABELS: Record<string, string> = {
  leave: 'Leave',
  equipment: 'Equipment',
  transcript: 'Transcript',
  complaint: 'Complaint',
  other: 'Other',
}

const TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  leave: 'calendar-outline',
  equipment: 'construct-outline',
  transcript: 'document-text-outline',
  complaint: 'alert-circle-outline',
  other: 'ellipsis-horizontal-circle-outline',
}

const STATUS_LABELS: Record<AcademicRequestStatus, string> = {
  approved: 'Approved',
  pending: 'Pending',
  rejected: 'Rejected',
}

function formatDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export default function AcademicRequestCard({
  request,
}: {
  request: AcademicRequest
}) {
  const theme = useAppTheme()
  const status = request.status ?? 'pending'
  const attachmentCount = request.attachments?.length ?? 0

  const statusColors: Record<
    AcademicRequestStatus,
    { background: string; text: string }
  > = {
    approved: { background: '#DCFCE7', text: '#166534' },
    pending: { background: '#FEF3C7', text: '#92400E' },
    rejected: { background: '#FEE2E2', text: '#991B1B' },
  }

  const openAttachment = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url)

      if (!supported) {
        Alert.alert('Cannot open attachment', 'This attachment URL is invalid.')
        return
      }

      await Linking.openURL(url)
    } catch {
      Alert.alert('Cannot open attachment', 'The attachment could not be opened.')
    }
  }

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.background, borderColor: theme.border },
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.typeIcon, { backgroundColor: theme.uiBackground }]}>
          <Ionicons
            name={TYPE_ICONS[request.type] ?? TYPE_ICONS.other}
            size={22}
            color={theme.primary}
          />
        </View>

        <View style={styles.headingText}>
          <ThemedText style={styles.typeText}>
            {TYPE_LABELS[request.type] ?? request.type}
          </ThemedText>
          <ThemedText title style={styles.subject} numberOfLines={2}>
            {request.subject}
          </ThemedText>
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusColors[status].background },
          ]}
        >
          <ThemedText
            style={[styles.statusText, { color: statusColors[status].text }]}
          >
            {STATUS_LABELS[status]}
          </ThemedText>
        </View>
      </View>

      <ThemedText style={styles.description}>{request.description}</ThemedText>

      {request.department?.name ? (
        <View style={styles.metaRow}>
          <Ionicons name='business-outline' size={16} color={theme.text} />
          <ThemedText style={styles.metaText}>{request.department.name}</ThemedText>
        </View>
      ) : null}

      <View style={styles.footer}>
        <View style={styles.metaRow}>
          <Ionicons name='calendar-outline' size={16} color={theme.text} />
          <ThemedText style={styles.metaText}>
            {formatDate(request.created_at)}
          </ThemedText>
        </View>

        {attachmentCount > 0 ? (
          <View style={styles.metaRow}>
            <Ionicons name='attach-outline' size={18} color={theme.text} />
            <ThemedText style={styles.metaText}>
              {attachmentCount} {attachmentCount === 1 ? 'file' : 'files'}
            </ThemedText>
          </View>
        ) : null}
      </View>

      {attachmentCount > 0 ? (
        <View style={[styles.attachments, { borderTopColor: theme.border }]}>
          {request.attachments.map((attachment) => (
            <Pressable
              key={attachment.id}
              onPress={() => openAttachment(attachment.file_url)}
              style={({ pressed }) => [
                styles.attachmentButton,
                { backgroundColor: theme.uiBackground },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name='document-attach-outline' size={18} color={theme.primary} />
              <ThemedText title style={styles.attachmentName} numberOfLines={1}>
                {attachment.file_name}
              </ThemedText>
              <Ionicons name='open-outline' size={17} color={theme.text} />
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 13,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
  },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingText: {
    flex: 1,
    minWidth: 0,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 3,
  },
  subject: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
  },
  attachments: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
    gap: 8,
  },
  attachmentButton: {
    minHeight: 42,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  attachmentName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.72,
  },
})
