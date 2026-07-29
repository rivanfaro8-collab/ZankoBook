import { Ionicons } from '@expo/vector-icons'
import { ScrollView, StyleSheet, View } from 'react-native'

import { useAppTheme } from '../../src/store/themeStore'
import SimpleBackHeader from '../SimpleBackHeader'
import ThemedText from '../ThemedText'
import ThemedView from '../ThemedView'

type GuideItem = {
  title: string
  description: string
}

export type GuideSection = {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  items: GuideItem[]
}

type RoleGuideScreenProps = {
  title: string
  intro: string
  sections: GuideSection[]
  tip: string
}

export default function RoleGuideScreen({
  title,
  intro,
  sections,
  tip,
}: RoleGuideScreenProps) {
  const theme = useAppTheme()

  return (
    <ThemedView style={styles.screen}>
      <SimpleBackHeader />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headingBlock}>
          <ThemedText title style={styles.title}>
            {title}
          </ThemedText>
          <ThemedText style={styles.intro}>{intro}</ThemedText>
        </View>

        {sections.map((section) => (
          <View
            key={section.title}
            style={[
              styles.sectionCard,
              { backgroundColor: theme.uiBackground, borderColor: theme.border },
            ]}
          >
            <View style={styles.sectionHeader}>
              <View style={[styles.iconBox, { backgroundColor: theme.primary }]}>
                <Ionicons name={section.icon} size={21} color='#FFFFFF' />
              </View>
              <ThemedText title style={styles.sectionTitle}>
                {section.title}
              </ThemedText>
            </View>

            <View style={styles.items}>
              {section.items.map((item, index) => (
                <View key={item.title} style={styles.itemRow}>
                  <View style={[styles.stepBadge, { borderColor: theme.primary }]}>
                    <ThemedText title style={[styles.stepNumber, { color: theme.primary }]}>
                      {index + 1}
                    </ThemedText>
                  </View>
                  <View style={styles.itemText}>
                    <ThemedText title style={styles.itemTitle}>
                      {item.title}
                    </ThemedText>
                    <ThemedText style={styles.itemDescription}>
                      {item.description}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}

        <View
          style={[
            styles.tipCard,
            { backgroundColor: theme.uiBackground, borderColor: theme.primary },
          ]}
        >
          <Ionicons name='information-circle-outline' size={23} color={theme.primary} />
          <ThemedText style={styles.tipText}>{tip}</ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 34,
    gap: 14,
  },
  headingBlock: {
    paddingHorizontal: 4,
    marginBottom: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  intro: {
    marginTop: 7,
    fontSize: 15,
    lineHeight: 22,
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginBottom: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
  },
  items: {
    gap: 15,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepBadge: {
    width: 27,
    height: 27,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: '800',
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  itemDescription: {
    marginTop: 3,
    fontSize: 14,
    lineHeight: 20,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderWidth: 1,
    borderRadius: 16,
    padding: 15,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
})
