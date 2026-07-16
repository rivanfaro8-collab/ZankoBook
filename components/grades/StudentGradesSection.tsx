import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'

import { getMyGrades } from '../../src/api/grades'
import { useAppTheme } from '../../src/store/themeStore'
import type { StudentCourseAssessment } from '../../src/types/grades'
import ThemedText from '../ThemedText'

const toNumber = (value: unknown): number => {
  const parsed = Number(value)
  return Number.isNaN(parsed) ? 0 : Math.round(parsed * 10) / 10
}

const formatNumber = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1)

const getStatusIcon = (status?: string | null): keyof typeof Ionicons.glyphMap => {
  const normalized = status?.trim().toLowerCase()

  if (normalized === 'graded' || normalized === 'published') {
    return 'checkmark-circle-outline'
  }

  if (normalized === 'pending' || normalized === 'submitted') {
    return 'time-outline'
  }

  return 'school-outline'
}

const AssessmentCard = ({ assessment }: { assessment: StudentCourseAssessment }) => {
  const theme = useAppTheme()
  const [expanded, setExpanded] = useState(false)

  const mark = toNumber(assessment.mark)
  const maxMark = toNumber(assessment.max_mark)
  const weight = toNumber(assessment.weight)
  const percentage = maxMark === 0 ? 0 : Math.min(100, Math.max(0, (mark / maxMark) * 100))
  const hasFeedback = Boolean(assessment.feedback?.trim())

  return (
    <Pressable
      accessibilityRole={hasFeedback ? 'button' : undefined}
      accessibilityState={hasFeedback ? { expanded } : undefined}
      onPress={() => hasFeedback && setExpanded((current) => !current)}
      style={({ pressed }) => [
        styles.assessmentCard,
        {
          backgroundColor: theme.uiBackground,
          borderColor: theme.border,
          opacity: pressed && hasFeedback ? 0.84 : 1,
        },
      ]}
    >
      <View style={styles.assessmentTopRow}>
        <View
          style={[
            styles.assessmentIcon,
            { backgroundColor: theme.background, borderColor: theme.border },
          ]}
        >
          <Ionicons
            name={getStatusIcon(assessment.status)}
            size={22}
            color={theme.primary}
          />
        </View>

        <View style={styles.assessmentTitleArea}>
          <ThemedText title style={styles.assessmentTitle}>
            {assessment.title || 'Assessment'}
          </ThemedText>

          <View style={styles.metaRow}>
            <View style={[styles.metaPill, { backgroundColor: theme.background }]}> 
              <Ionicons name='scale-outline' size={13} color={theme.text} />
              <ThemedText style={styles.metaText}>Weight {formatNumber(weight)}</ThemedText>
            </View>

            {assessment.status ? (
              <View style={[styles.metaPill, { backgroundColor: theme.background }]}> 
                <Ionicons name='information-circle-outline' size={13} color={theme.text} />
                <ThemedText style={styles.metaText}>{assessment.status}</ThemedText>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.gradeArea}>
          <ThemedText title style={styles.gradeValue}>{formatNumber(mark)}</ThemedText>
          <ThemedText style={styles.maxGrade}>/ {formatNumber(maxMark)}</ThemedText>
        </View>
      </View>

      <View style={[styles.progressTrack, { backgroundColor: theme.background }]}> 
        <View
          style={[
            styles.progressFill,
            { backgroundColor: theme.primary, width: `${percentage}%` },
          ]}
        />
      </View>

      {hasFeedback ? (
        <>
          <View style={styles.feedbackHint}>
            <Ionicons
              name={expanded ? 'chevron-up-outline' : 'chevron-down-outline'}
              size={17}
              color={theme.primary}
            />
            <ThemedText style={[styles.feedbackHintText, { color: theme.primary }]}> 
              {expanded ? 'Hide feedback' : 'View feedback'}
            </ThemedText>
          </View>

          {expanded ? (
            <View
              style={[
                styles.feedbackBox,
                { backgroundColor: theme.background, borderColor: theme.border },
              ]}
            >
              <ThemedText title style={styles.feedbackTitle}>Lecturer feedback</ThemedText>
              <ThemedText style={styles.feedbackText}>{assessment.feedback}</ThemedText>
            </View>
          ) : null}
        </>
      ) : null}
    </Pressable>
  )
}

type Props = {
  courseId: number
  courseName: string
}

export default function StudentGradesSection({ courseId, courseName }: Props) {
  const theme = useAppTheme()

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['my-grades', courseId],
    queryFn: () => getMyGrades(courseId),
    enabled: courseId > 0,
  })

  const assessments = data?.assessments ?? []

  const totals = useMemo(() => {
    const earned = assessments.reduce(
      (sum, assessment) => sum + toNumber(assessment.mark),
      0,
    )
    const possible = assessments.reduce(
      (sum, assessment) => sum + toNumber(assessment.max_mark),
      0,
    )

    return {
      earned: Math.round(earned * 10) / 10,
      possible: Math.round(possible * 10) / 10,
      percentage:
        possible === 0 ? 0 : Math.min(100, Math.max(0, (earned / possible) * 100)),
    }
  }, [assessments])

  if (isLoading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size='large' color={theme.primary} />
        <ThemedText style={styles.stateText}>Loading your grades...</ThemedText>
      </View>
    )
  }

  if (isError) {
    return (
      <View style={styles.centerState}>
        <View style={[styles.stateIcon, { backgroundColor: theme.uiBackground }]}> 
          <Ionicons name='alert-circle-outline' size={34} color={theme.danger} />
        </View>
        <ThemedText title style={styles.stateTitle}>Could not load grades</ThemedText>
        <ThemedText style={styles.stateText}>
          {error instanceof Error ? error.message : 'Please try again.'}
        </ThemedText>
        <Pressable
          onPress={() => refetch()}
          style={({ pressed }) => [
            styles.retryButton,
            { backgroundColor: theme.primary, opacity: pressed ? 0.75 : 1 },
          ]}
        >
          <Ionicons name='refresh-outline' size={18} color='#FFFFFF' />
          <ThemedText style={styles.retryText}>Retry</ThemedText>
        </Pressable>
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={theme.primary}
          colors={[theme.primary]}
        />
      }
    >
      <View style={[styles.summaryCard, { backgroundColor: theme.primary }]}> 
        <View style={styles.summaryHeader}>
          <View style={styles.summaryTextArea}>
            <ThemedText style={styles.summaryEyebrow}>YOUR TOTAL</ThemedText>
            <ThemedText style={styles.courseName} numberOfLines={2}>
              {courseName}
            </ThemedText>
          </View>

          <View style={styles.summaryIcon}>
            <Ionicons name='trophy-outline' size={27} color='#FFFFFF' />
          </View>
        </View>

        <View style={styles.totalRow}>
          <ThemedText style={styles.totalEarned}>{formatNumber(totals.earned)}</ThemedText>
          <ThemedText style={styles.totalPossible}>/ {formatNumber(totals.possible)}</ThemedText>
        </View>
        <ThemedText style={styles.marksLabel}>marks</ThemedText>

        <View style={styles.summaryProgressTrack}>
          <View style={[styles.summaryProgressFill, { width: `${totals.percentage}%` }]} />
        </View>

        <View style={styles.summaryFooter}>
          <ThemedText style={styles.summaryFooterText}>
            {assessments.length} {assessments.length === 1 ? 'assessment' : 'assessments'}
          </ThemedText>
          <ThemedText style={styles.summaryFooterText}>
            {Math.round(totals.percentage)}%
          </ThemedText>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name='clipboard-outline' size={18} color={theme.primary} />
          <ThemedText title style={styles.sectionTitle}>Assessment results</ThemedText>
        </View>
        <ThemedText style={styles.sectionCount}>{assessments.length}</ThemedText>
      </View>

      {assessments.length === 0 ? (
        <View
          style={[
            styles.emptyCard,
            { backgroundColor: theme.uiBackground, borderColor: theme.border },
          ]}
        >
          <View style={[styles.stateIcon, { backgroundColor: theme.background }]}> 
            <Ionicons name='school-outline' size={34} color={theme.primary} />
          </View>
          <ThemedText title style={styles.stateTitle}>No grades yet</ThemedText>
          <ThemedText style={styles.stateText}>
            Your assessment grades will appear here after they are published.
          </ThemedText>
        </View>
      ) : (
        <View style={styles.assessmentList}>
          {assessments.map((assessment) => (
            <AssessmentCard
              key={assessment.assessment_id}
              assessment={assessment}
            />
          ))}
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 36 },
  summaryCard: {
    borderRadius: 26,
    padding: 22,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 7,
  },
  summaryHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  summaryTextArea: { flex: 1, paddingRight: 12 },
  summaryEyebrow: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  courseName: { color: '#FFFFFF', marginTop: 5, fontSize: 16, fontWeight: '700' },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 20 },
  totalEarned: { color: '#FFFFFF', fontSize: 56, lineHeight: 62, fontWeight: '900' },
  totalPossible: {
    color: 'rgba(255,255,255,0.64)',
    marginLeft: 7,
    fontSize: 22,
    fontWeight: '700',
  },
  marksLabel: { color: 'rgba(255,255,255,0.72)', fontSize: 13, fontWeight: '600' },
  summaryProgressTrack: {
    height: 7,
    marginTop: 18,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.22)',
    overflow: 'hidden',
  },
  summaryProgressFill: { height: '100%', borderRadius: 999, backgroundColor: '#FFFFFF' },
  summaryFooter: { marginTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
  summaryFooterText: { color: 'rgba(255,255,255,0.76)', fontSize: 12, fontWeight: '700' },
  sectionHeader: {
    marginTop: 25,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  sectionTitle: { fontSize: 16, fontWeight: '800' },
  sectionCount: { fontSize: 12, fontWeight: '800' },
  assessmentList: { gap: 12 },
  assessmentCard: { borderWidth: 1, borderRadius: 18, padding: 15 },
  assessmentTopRow: { flexDirection: 'row', alignItems: 'center' },
  assessmentIcon: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assessmentTitleArea: { flex: 1, marginHorizontal: 12 },
  assessmentTitle: { fontSize: 15, lineHeight: 20, fontWeight: '800' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  metaPill: {
    minHeight: 24,
    paddingHorizontal: 8,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: { fontSize: 10, fontWeight: '700' },
  gradeArea: { alignItems: 'flex-end', minWidth: 62 },
  gradeValue: { fontSize: 22, fontWeight: '900' },
  maxGrade: { marginTop: 1, fontSize: 12, fontWeight: '700' },
  progressTrack: { height: 5, marginTop: 14, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },
  feedbackHint: {
    marginTop: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackHintText: { fontSize: 12, fontWeight: '800' },
  feedbackBox: { marginTop: 10, borderWidth: 1, borderRadius: 13, padding: 12 },
  feedbackTitle: { fontSize: 12, fontWeight: '800' },
  feedbackText: { marginTop: 5, fontSize: 13, lineHeight: 19 },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  emptyCard: { borderWidth: 1, borderRadius: 20, padding: 28, alignItems: 'center' },
  stateIcon: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  stateTitle: { marginTop: 14, fontSize: 19, fontWeight: '800', textAlign: 'center' },
  stateText: { marginTop: 7, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  retryButton: {
    minHeight: 46,
    marginTop: 18,
    borderRadius: 13,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  retryText: { color: '#FFFFFF', fontWeight: '800' },
})
