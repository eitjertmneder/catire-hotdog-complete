import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthScreen from '../modules/auth/modules/auth/screens/AuthScreen';
import { GoogleSignInScreen } from '../modules/auth/modules/auth/screens/GoogleSignInScreen';
import BranchList from '../modules/catalog/modules/branches/screens/BranchList';
import { OrdersScreen } from '../modules/orders/modules/orders/screens/OrdersScreen';
import BranchesMap from '../modules/catalog/modules/branches/screens/BranchesMap';
import ProductDetails from '../modules/catalog/modules/products/screens/ProductDetails';
import PurchasesList from '../modules/finance/modules/purchases/screens/PurchasesList';
import { useAuthStore } from '../shared/store/auth.store';
import { useOnboardingStore } from '../shared/store/onboarding.store';
import { MenuList } from '../modules/catalog/modules/menu/screens/MenuList';
import { Navbar } from '../shared/components/Navbar';
import { CartScreen } from '../modules/catalog/modules/products/screens/CartScreen';
import { OrderDetails } from '../modules/orders/modules/orders/screens/OrderDetails';
import { ProfileScreen } from '../modules/auth/modules/users/screens/ProfileScreen';
import { EmployeeOrdersScreen } from '../modules/orders/modules/orders/screens/EmployeeOrdersScreen';
import { ProductsAdmin } from '../modules/catalog/modules/products/screens/ProductsAdmin';
import { MenuAdmin } from '../modules/catalog/modules/menu/screens/MenuAdmin';
import { MenuForm } from '../modules/catalog/modules/menu/forms/MenuForm';
import { ProductForm } from '../modules/catalog/modules/products/forms/ProductForm';
import { OrdersAdmin } from '../modules/orders/modules/orders/screens/OrderAdmin';
import { BranchAdmin } from '../modules/catalog/modules/branches/screens/BranchAdmin';
import { UsersAdmin } from '../modules/auth/modules/users/screens/UserAdmin';
import { AdminScreen } from '../shared/screens/AdminScreen';
import { BranchForm } from '../modules/catalog/modules/branches/forms/BranchForm';
import { UserForm } from '../modules/auth/modules/users/forms/UserForm';
import { InventoryAdmin } from '../modules/inventory/screens/InventoryAdmin';
import { NightlyClosureScreen } from '../modules/inventory/screens/NightlyClosureScreen';
import { ReportsScreen } from '../modules/orders/modules/orders/screens/ReportsScreen';
import { CreateCajeroScreen } from '../modules/auth/modules/users/screens/CreateCajeroScreen';
import { ShiftScreen } from '../modules/orders/modules/orders/screens/ShiftScreen';
import BuildOrderScreen from '../modules/catalog/screens/BuildOrderScreen';
import HomeScreen from '../modules/catalog/screens/HomeScreen';
import MenuScreen from '../modules/catalog/screens/MenuScreen';
import { CurrencyRatesScreen } from '../modules/finance/screens/CurrencyRatesScreen';
import { PaymentConfigScreen } from '../modules/finance/screens/PaymentConfigScreen';
import { DashboardScreen } from '../shared/screens/DashboardScreen';
import { OrderHistoryScreen } from '../shared/screens/OrderHistoryScreen';
import { SettingsScreen } from '../shared/screens/SettingsScreen';
import { ChatScreen } from '../modules/orders/screens/ChatScreen';
import { ReviewScreen } from '../modules/orders/screens/ReviewScreen';
import { PromotionsScreen } from '../modules/finance/screens/PromotionsScreen';
import { LoyaltyScreen } from '../modules/finance/screens/LoyaltyScreen';
import { VoiceOrderScreen } from '../modules/catalog/screens/VoiceOrderScreen';
import { AnalyticsScreen } from '../shared/screens/AnalyticsScreen';
import { OnboardingScreen } from '../shared/screens/OnboardingScreen';
import { ReferralsScreen } from '../shared/screens/ReferralsScreen';
import { RecipesScreen } from '../modules/catalog/screens/RecipesScreen';
import { AdvancedReportsScreen } from '../shared/screens/AdvancedReportsScreen';
import { ShiftScreen as EmployeeShiftScreen } from '../modules/orders/screens/ShiftScreen';
import { OrderTrackingScreen } from '../modules/orders/screens/OrderTrackingScreen';
import { FeedbackAnalyticsScreen } from '../shared/screens/FeedbackAnalyticsScreen';
import { TransferScreen } from '../modules/inventory/screens/TransferScreen';
import { KitchenDisplayScreen } from '../modules/orders/screens/KitchenDisplayScreen';
import { DeliveryPartnersScreen } from '../shared/screens/DeliveryPartnersScreen';
import { SupplierScreen } from '../shared/screens/SupplierScreen';
import { GamificationScreen } from '../shared/screens/GamificationScreen';
import { TwoFAScreen } from '../shared/screens/TwoFAScreen';
import { EmailTemplatesScreen } from '../shared/screens/EmailTemplatesScreen';
import { SessionsScreen } from '../shared/screens/SessionsScreen';
import { AuditDashboardScreen } from '../shared/screens/AuditDashboardScreen';
import { PDFReportsScreen } from '../shared/screens/PDFReportsScreen';
import { GoogleMapsScreen } from '../shared/screens/GoogleMapsScreen';
import { PaymentsScreen } from '../shared/screens/PaymentsScreen';
import { TableManagementScreen } from '../modules/inventory/screens/TableManagementScreen';
import { AdminReviewsScreen } from '../shared/screens/AdminReviewsScreen';
import { MyReviewsScreen } from '../shared/screens/MyReviewsScreen';

const Stack = createNativeStackNavigator();

export default function MainNavigator() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const hasCompletedOnboarding = useOnboardingStore((s) => s.hasCompletedOnboarding);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!token ? (
          <>
            {!hasCompletedOnboarding && (
              <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
            )}
            <Stack.Screen name="Login" component={AuthScreen} options={{ headerShown: false }} />
            <Stack.Screen name="GoogleSignIn" component={GoogleSignInScreen} options={{ headerShown: false }} />
          </>
        ) : (
          <Stack.Group screenOptions={{ header: () => <Navbar /> }}>
            {/* Client screens */}
            {user?.role.name === 'client' && (
              <>
                <Stack.Screen name="BranchesMap" component={BranchesMap} />
                <Stack.Screen name="Branches" component={BranchList} />
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Menu" component={MenuScreen} />
                <Stack.Screen name="BuildOrder" component={BuildOrderScreen} />
                <Stack.Screen name="MenuList" component={MenuList} />
                <Stack.Screen name="ProductDetails" component={ProductDetails} />
                <Stack.Screen name="VoiceOrder" component={VoiceOrderScreen} />
                <Stack.Screen name="Cart" component={CartScreen} />
              </>
            )}

            {/* Employee screens */}
            {user?.role.name === 'employee' && (
              <>
                <Stack.Screen name="EmployeeOrders" component={EmployeeOrdersScreen} />
                <Stack.Screen name="Shift" component={ShiftScreen} />
                <Stack.Screen name="InventoryAdmin" component={InventoryAdmin} />
                <Stack.Screen name="EmployeeMenuAdmin" component={MenuAdmin} />
                <Stack.Screen name="ProductsAdmin" component={ProductsAdmin} />
                <Stack.Screen name="ReportsScreen" component={ReportsScreen} />
                <Stack.Screen name="MenuForm" component={MenuForm} />
                <Stack.Screen name="ProductForm" component={ProductForm} />
              </>
            )}

            {/* Admin screens */}
            {user?.role.name === 'admin' && (
              <>
                <Stack.Screen name="AdminScreen" component={AdminScreen} />
                <Stack.Screen name="EmployeeMenuAdmin" component={MenuAdmin} />
                <Stack.Screen name="MenuAdmin" component={MenuAdmin} />
                <Stack.Screen name="BranchAdmin" component={BranchAdmin} />
                <Stack.Screen name="ProductsAdmin" component={ProductsAdmin} />
                <Stack.Screen name="OrdersAdmin" component={OrdersAdmin} />
                <Stack.Screen name="UsersAdmin" component={UsersAdmin} />
                <Stack.Screen name="CreateCajero" component={CreateCajeroScreen} />
                <Stack.Screen name="InventoryAdmin" component={InventoryAdmin} />
                <Stack.Screen name="NightlyClosure" component={NightlyClosureScreen} />
                <Stack.Screen name="ReportsScreen" component={ReportsScreen} />
                <Stack.Screen name="Dashboard" component={DashboardScreen} />
                <Stack.Screen name="Analytics" component={AnalyticsScreen} />
                <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
                <Stack.Screen name="Recipes" component={RecipesScreen} />
                <Stack.Screen name="AdvancedReports" component={AdvancedReportsScreen} />
                <Stack.Screen name="EmployeeShift" component={EmployeeShiftScreen} />
                <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
                <Stack.Screen name="FeedbackAnalytics" component={FeedbackAnalyticsScreen} />
                <Stack.Screen name="Transfers" component={TransferScreen} />
                <Stack.Screen name="KitchenDisplay" component={KitchenDisplayScreen} />
                <Stack.Screen name="DeliveryPartners" component={DeliveryPartnersScreen} />
                <Stack.Screen name="Suppliers" component={SupplierScreen} />
                <Stack.Screen name="Gamification" component={GamificationScreen} />
                <Stack.Screen name="TwoFA" component={TwoFAScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
                <Stack.Screen name="Referrals" component={ReferralsScreen} />
                <Stack.Screen name="CurrencyRates" component={CurrencyRatesScreen} />
                <Stack.Screen name="PaymentConfig" component={PaymentConfigScreen} />
                <Stack.Screen name="EmailTemplates" component={EmailTemplatesScreen} />
                <Stack.Screen name="Sessions" component={SessionsScreen} />
                <Stack.Screen name="AuditLogs" component={AuditDashboardScreen} />
                <Stack.Screen name="PDFReports" component={PDFReportsScreen} />
                <Stack.Screen name="GoogleMaps" component={GoogleMapsScreen} />
                <Stack.Screen name="Payments" component={PaymentsScreen} />
                <Stack.Screen name="MenuForm" component={MenuForm} />
                <Stack.Screen name="BranchForm" component={BranchForm} />
                <Stack.Screen name="ProductForm" component={ProductForm} />
                <Stack.Screen name="UserForm" component={UserForm} />
                <Stack.Screen name="TableManagement" component={TableManagementScreen} />
                <Stack.Screen name="AdminReviews" component={AdminReviewsScreen} />
              </>
            )}

            {/* Guest screens */}
            {user?.role.name === 'guest' && (
              <>
                <Stack.Screen name="BranchesMap" component={BranchesMap} />
                <Stack.Screen name="Branches" component={BranchList} />
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Menu" component={MenuScreen} />
                <Stack.Screen name="BuildOrder" component={BuildOrderScreen} />
                <Stack.Screen name="MenuList" component={MenuList} />
                <Stack.Screen name="ProductDetails" component={ProductDetails} />
                <Stack.Screen name="Cart" component={CartScreen} />
              </>
            )}

            {/* Shared screens */}
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="Review" component={ReviewScreen} />
            <Stack.Screen name="MyReviews" component={MyReviewsScreen} />
            <Stack.Screen name="Promotions" component={PromotionsScreen} />
            <Stack.Screen name="Loyalty" component={LoyaltyScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Orders" component={OrdersScreen} />
            <Stack.Screen name="OrderDetails" component={OrderDetails} />
            <Stack.Screen name="Purchases" component={PurchasesList} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
