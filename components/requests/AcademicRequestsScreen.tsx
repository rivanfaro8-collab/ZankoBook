import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native'

import { getAcademicRequests } from '@/api/academicRequests'
import { useAppTheme } from '@/store/themeStore'
import ThemedText from '../ThemedText'
import ThemedView from '../ThemedView'
import AcademicRequestCard from './AcademicRequestCard'
import NewAcademicRequestModal from './NewAcademicRequestModal'

export default function AcademicRequestsScreen() {
  const theme = useAppTheme()
  const [modalVisible, setModalVisible] = useState(false)

  const requestsQuery = useQuery({
    queryKey: ['academic-requests'],
    queryFn: getAcademicRequests,
  })

  const requests = requestsQuery.data ?? []

  const header = (
    <View style={styles.header}>
      <View style={styles.headingText}>
        <ThemedText title style={styles.title}>Requests</ThemedText>
        <ThemedText style={styles.subtitle}>
          Requests are forwarded to your department in e-Zanko.
        </ThemedText>
      </View>

      <Pressable
        onPress={() => setModalVisible(true)}
        accessibilityRole='button'
        accessibilityLabel='Create a new academic request'
        style={({ pressed }) => [
          styles.newButton,
          { backgroundColor: theme.primary },
          pressed && styles.pressed,
        ]}
      >
        <Ionicons name='add' size={22} color='#FFFFFF' />
        <ThemedText style={styles.newButtonText}>New</ThemedText>
      </Pressable>
    </View>
  )

  if (requestsQuery.isLoading) {
    return (
      <ThemedView style={styles.screen}>
        {header}
        <View style={styles.centerState}>
          <ActivityIndicator size='large' color={theme.primary} />
          <ThemedText style={styles.stateText}>Loading requests...</ThemedText>
        </View>
        <NewAcademicRequestModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />
      </ThemedView>
    )
  }

  if (requestsQuery.isError) {
    return (
      <ThemedView style={styles.screen}>
        {header}
        <View style={styles.centerState}>
          <View style={[styles.stateIcon, { backgroundColor: theme.uiBackground }]}>
            <Ionicons name='cloud-offline-outline' size={34} color={theme.danger} />
          </View>
          <ThemedText title style={styles.stateTitle}>Could not load requests</ThemedText>
          <ThemedText style={styles.stateText}>
            {requestsQuery.error instanceof Error
              ? requestsQuery.error.message
              : 'Please try again.'}
          </ThemedText>
          <Pressable
            onPress={() => requestsQuery.refetch()}
            style={({ pressed }) => [
              styles.retryButton,
              { borderColor: theme.primary },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name='refresh-outline' size={19} color={theme.primary} />
            <ThemedText title style={[styles.retryText, { color: theme.primary }]}>
              Try again
            </ThemedText>
          </Pressable>
        </View>
        <NewAcademicRequestModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />
      </ThemedView>
    )
  }

  return (
    <ThemedView style={styles.screen}>
      <FlatList
        data={requests}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <AcademicRequestCard request={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={[styles.stateIcon, { backgroundColor: theme.uiBackground }]}>
              <Ionicons name='document-text-outline' size={36} color={theme.primary} />
            </View>
            <ThemedText title style={styles.stateTitle}>No requests yet</ThemedText>
            <ThemedText style={styles.stateText}>
              Requests you submit will appear here and be forwarded to your department.
            </ThemedText>
            <Pressable
              onPress={() => setModalVisible(true)}
              style={({ pressed }) => [
                styles.emptyAction,
                { backgroundColor: theme.primary },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name='add' size={20} color='#FFFFFF' />
              <ThemedText style={styles.emptyActionText}>New request</ThemedText>
            </Pressable>
          </View>
        }
        contentContainerStyle={[
          styles.content,
          requests.length === 0 && styles.emptyContent,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={requestsQuery.isRefetching}
            onRefresh={requestsQuery.refetch}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      />

      <NewAcademicRequestModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 32,
  },
  emptyContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
    marginBottom: 22,
  },
  headingText: {
    flex: 1,
  },
  title: {
    fontSize: 27,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
  },
  newButton: {
    minHeight: 44,
    borderRadius: 13,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  newButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  separator: {
    height: 13,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingBottom: 80,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingBottom: 80,
  },
  stateIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  stateTitle: {
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
  },
  stateText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  retryButton: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 13,
    marginTop: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '800',
  },
  emptyAction: {
    minHeight: 48,
    borderRadius: 14,
    marginTop: 20,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.72,
  },
})
