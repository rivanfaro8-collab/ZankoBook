import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import { useState } from 'react'
import { Modal, Pressable, StyleSheet, View } from 'react-native'

import AppDrawer from '../../../components/AppDrawer'
import AppHeader from '../../../components/AppHeader'
import { useAppTheme } from '../../store/themeStore'

export default function LecturerLayout() {
  const theme = useAppTheme()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <Tabs
        screenOptions={{
          header: () => <AppHeader onMenuPress={() => setDrawerOpen(true)} />,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: theme.background,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          sceneStyle: {
            backgroundColor: theme.background,
          },
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.text,
          tabBarStyle: {
            backgroundColor: theme.background,
            borderTopColor: theme.border,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name='Dashboard'
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? 'grid' : 'grid-outline'} size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name='Letters'
          options={{
            title: 'Letters',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? 'mail' : 'mail-outline'} size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name='Notifications'
          options={{
            title: 'Notifications',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? 'notifications' : 'notifications-outline'}
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name='Profile'
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? 'person-circle' : 'person-circle-outline'}
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name='downloaded'
          options={{
            href: null,
            headerShown: false,
            tabBarStyle: { display: 'none' },
          }}
        />
        <Tabs.Screen
          name='guide'
          options={{
            href: null,
            headerShown: false,
            tabBarStyle: { display: 'none' },
          }}
        />
      </Tabs>

      <Modal visible={drawerOpen} transparent animationType='slide' onRequestClose={() => setDrawerOpen(false)}>
        <View style={styles.modalRoot}>
          <View style={styles.drawerPane}>
            <AppDrawer role='lecturer' onClose={() => setDrawerOpen(false)} />
          </View>
          <Pressable
            style={styles.overlay}
            onPress={() => setDrawerOpen(false)}
            accessibilityRole='button'
            accessibilityLabel='Close menu'
          />
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  drawerPane: {
    width: '84%',
    maxWidth: 380,
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 4, height: 0 },
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
  },
})
