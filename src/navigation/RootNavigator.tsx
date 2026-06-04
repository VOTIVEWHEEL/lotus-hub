import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Colors, Typography } from '../constants/theme';
import { useUserStore } from '../store';

// Screens
import { OnboardingScreen } from '../screens/Auth/OnboardingScreen';
import { DashboardScreen } from '../screens/Dashboard/DashboardScreen';
import { TasksScreen } from '../screens/Tasks/TasksScreen';
import { NotesScreen } from '../screens/Notes/NotesScreen';
import { CoursesScreen } from '../screens/Courses/CoursesScreen';
import { HabitsScreen } from '../screens/Habits/HabitsScreen';
import { TimerScreen } from '../screens/Timer/TimerScreen';
import { CommunityScreen } from '../screens/Community/CommunityScreen';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TAB_SCREENS = [
  { name: 'Dashboard', component: DashboardScreen, icon: 'home', activeIcon: 'home', label: 'Home' },
  { name: 'Tasks', component: TasksScreen, icon: 'list-outline', activeIcon: 'list', label: 'Tasks' },
  { name: 'Notes', component: NotesScreen, icon: 'document-text-outline', activeIcon: 'document-text', label: 'Notes' },
  { name: 'Courses', component: CoursesScreen, icon: 'school-outline', activeIcon: 'school', label: 'Courses' },
  { name: 'Habits', component: HabitsScreen, icon: 'checkmark-circle-outline', activeIcon: 'checkmark-circle', label: 'Habits' },
  { name: 'Timer', component: TimerScreen, icon: 'timer-outline', activeIcon: 'timer', label: 'Timer' },
  { name: 'Community', component: CommunityScreen, icon: 'people-outline', activeIcon: 'people', label: 'Community' },
  { name: 'Profile', component: ProfileScreen, icon: 'person-outline', activeIcon: 'person', label: 'Profile' },
];

const TAB_COLORS: Record<string, string> = {
  Dashboard: Colors.primary,
  Tasks: Colors.tasks,
  Notes: Colors.notes,
  Courses: Colors.courses,
  Habits: Colors.habits,
  Timer: Colors.timer,
  Community: Colors.community,
  Profile: Colors.primary,
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
        ),
        tabBarActiveTintColor: TAB_COLORS[route.name] ?? Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          ...Typography.bodyMedium,
          marginBottom: 2,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const screen = TAB_SCREENS.find((s) => s.name === route.name);
          const iconName = focused ? (screen?.activeIcon ?? screen?.icon) : screen?.icon;
          return <Ionicons name={iconName as any} size={22} color={color} />;
        },
      })}
    >
      {TAB_SCREENS.map((screen) => (
        <Tab.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
          options={{ tabBarLabel: screen.label }}
        />
      ))}
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { isOnboarded } = useUserStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isOnboarded ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: 'transparent',
    elevation: 0,
    height: 80,
    paddingTop: 8,
  },
});
