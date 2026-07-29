import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

import { useAppTheme } from '../../src/store/themeStore'
import { useUserStore } from '../../src/store/userStore'
import ThemedButton from '../ThemedButton'
import ThemedText from '../ThemedText'
import ThemedView from '../ThemedView'
import ChangePasswordModal from './ChangePasswordModal'

type ProfileRowProps = {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  value: string
}

function ProfileRow({ icon, label, value }: ProfileRowProps) {
  const theme = useAppTheme()

  return (
    <View style={[styles.row, { borderBottomColor: theme.border }]}>
      <View style={[styles.iconBox, { backgroundColor: theme.uiBackground }]}>
        <Ionicons name={icon} size={20} color={theme.primary} />
      </View>
      <View style={styles.rowText}>
        <ThemedText style={styles.label}>{label}</ThemedText>
        <ThemedText title style={styles.value}>
          {value}
        </ThemedText>
      </View>
    </View>
  )
}

export default function ProfileScreen() {
  const theme = useAppTheme()
  const user = useUserStore((state) => state.user)
  const [passwordModalVisible, setPasswordModalVisible] = useState(false)

  const primaryScope = user?.scopes?.[0]
  const department = primaryScope?.scope?.name ?? 'Not assigned'
  const faculty = primaryScope?.scope?.faculty?.name ?? 'Not assigned'
  const university =
    primaryScope?.scope?.faculty?.university?.name ?? 'Not assigned'
  const role = user?.roles?.[0]?.name
    ? user.roles[0].name.charAt(0).toUpperCase() + user.roles[0].name.slice(1)
    : 'Not assigned'

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText title style={styles.title}>
          Profile
        </ThemedText>

        <View
          style={[
            styles.card,
            { backgroundColor: theme.background, borderColor: theme.border },
          ]}
        >
          <ProfileRow icon='person-outline' label='Name' value={user?.name ?? 'Not available'} />
          <ProfileRow icon='mail-outline' label='Email' value={user?.email ?? 'Not available'} />
          <ProfileRow icon='call-outline' label='Phone' value={user?.phone ?? 'Not available'} />
          <ProfileRow icon='school-outline' label='Role' value={role} />
          <ProfileRow icon='business-outline' label='University' value={university} />
          <ProfileRow icon='library-outline' label='Faculty' value={faculty} />
          <ProfileRow icon='layers-outline' label='Department' value={department} />
        </View>

        <ThemedButton
          onPress={() => setPasswordModalVisible(true)}
          accessibilityRole='button'
          accessibilityLabel='Open change password popup'
          style={styles.passwordButton}
        >
          <Ionicons name='lock-closed-outline' size={21} color='#FFFFFF' />
          <ThemedText style={styles.passwordButtonText}>Change Password</ThemedText>
        </ThemedButton>
      </ScrollView>

      <ChangePasswordModal
        visible={passwordModalVisible}
        onClose={() => setPasswordModalVisible(false)}
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
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 18,
  },
  card: {
    borderWidth: 1,
    borderRadius: 22,
    overflow: 'hidden',
  },
  row: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    marginBottom: 3,
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
  },
  passwordButton: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
  },
  passwordButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
})
