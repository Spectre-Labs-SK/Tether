import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FitnessOnboardingGrid, { type RootStackParamList } from './screens/FitnessOnboardingGrid';
import PushDayOnboarding from './screens/PushDayOnboarding';
import RoadSession from './screens/RoadSession';
import MatSession from './screens/MatSession';
import HubSession from './screens/HubSession';
import WorkoutSummary from './screens/WorkoutSummary';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function NativeApp() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="FitnessOnboardingGrid"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="FitnessOnboardingGrid" component={FitnessOnboardingGrid} />
        <Stack.Screen name="PushDayOnboarding" component={PushDayOnboarding} />
        <Stack.Screen name="RoadSession" component={RoadSession} />
        <Stack.Screen name="MatSession" component={MatSession} />
        <Stack.Screen name="HubSession" component={HubSession} />
        <Stack.Screen name="WorkoutSummary" component={WorkoutSummary} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
