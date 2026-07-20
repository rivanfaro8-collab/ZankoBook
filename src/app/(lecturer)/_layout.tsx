import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import { useState } from 'react'
import { Dimensions } from 'react-native'
import { Drawer } from 'react-native-drawer-layout'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import AppDrawer from '../../../components/AppDrawer'
import AppHeader from '../../../components/AppHeader'
import { useAppTheme } from '../../store/themeStore'

const DRAWER_WIDTH = Math.min(Dimensions.get('window').width * 0.84, 380)

type LecturerTabsProps = {
  onMenuPress: () => void
}

function LecturerTabs({ onMenuPress }: LecturerTabsProps) {
  const theme = useAppTheme()

  return (
    <Tabs
      screenOptions={{
        header: () => <AppHeader onMenuPress={onMenuPress} />,
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
          title: 'Requests',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'document-text' : 'document-text-outline'} size={size} color={color} />
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
        name='course/[courseId]'
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
  )
}

export default function LecturerLayout() {
  const theme = useAppTheme()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const openDrawer = () => setDrawerOpen(true)
  const closeDrawer = () => setDrawerOpen(false)

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        open={drawerOpen}
        onOpen={openDrawer}
        onClose={closeDrawer}
        drawerPosition='left'
        drawerType='front'
        swipeEnabled
        drawerStyle={{
          width: DRAWER_WIDTH,
          backgroundColor: theme.background,
        }}
        overlayStyle={{
          backgroundColor: 'rgba(0, 0, 0, 0.36)',
        }}
        renderDrawerContent={() => <AppDrawer role='lecturer' onClose={closeDrawer} />}
      >
        <LecturerTabs onMenuPress={openDrawer} />
      </Drawer>
    </GestureHandlerRootView>
  )
}
