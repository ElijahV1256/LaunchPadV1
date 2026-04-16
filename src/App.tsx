import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useRouteGuard } from './hooks/useRouteGuard';
import MissionControlFAB from './components/MissionControlFAB';

const Homepage = lazy(() => import('./pages/Homepage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Ideas = lazy(() => import('./pages/Ideas'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const FirstRevenue = lazy(() => import('./pages/FirstRevenue'));
const LocalOpportunities = lazy(() => import('./pages/LocalOpportunities'));
const LocalResults = lazy(() => import('./pages/LocalResults'));
const Pricing = lazy(() => import('./pages/Pricing'));
const ProSuccess = lazy(() => import('./pages/ProSuccess'));
const Roadmap = lazy(() => import('./pages/Roadmap'));
const StoryBrandRoadmap = lazy(() => import('./pages/StoryBrandRoadmap'));
const MasterSheet = lazy(() => import('./pages/MasterSheet'));
const Resources = lazy(() => import('./pages/Resources'));
const BrandIdentity = lazy(() => import('./pages/BrandIdentity'));
const LogoEditor = lazy(() => import('./pages/LogoEditor'));
const MarketingAssets = lazy(() => import('./pages/MarketingAssets'));
const WebsiteBuilder = lazy(() => import('./pages/WebsiteBuilder'));
const Operations = lazy(() => import('./pages/Operations'));
const ScaleOptimize = lazy(() => import('./pages/ScaleOptimize'));
const SavedIdeas = lazy(() => import('./pages/SavedIdeas'));
const SavedNames = lazy(() => import('./pages/SavedNames'));
const NanoGenerator = lazy(() => import('./pages/NanoGenerator'));
const StoryBrandWizard = lazy(() => import('./pages/StoryBrandWizard'));
const Website = lazy(() => import('./pages/Website'));
const ManageWebsite = lazy(() => import('./pages/ManageWebsite'));
const MarketingStrategy = lazy(() => import('./pages/MarketingStrategy'));
const MarketingPlaybook = lazy(() => import('./pages/MarketingPlaybook'));
const PlatformPlaybook = lazy(() => import('./pages/PlatformPlaybook'));
const LegalFoundation = lazy(() => import('./pages/LegalFoundation'));
const MissionControl = lazy(() => import('./pages/MissionControl'));
const LegalStructure = lazy(() => import('./pages/legal/LegalStructure'));
const FormLLC = lazy(() => import('./pages/legal/FormLLC'));
const GetEIN = lazy(() => import('./pages/legal/GetEIN'));
const BusinessBank = lazy(() => import('./pages/legal/BusinessBank'));
const BusinessInsurance = lazy(() => import('./pages/legal/BusinessInsurance'));
const LocalLicenses = lazy(() => import('./pages/legal/LocalLicenses'));

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  useRouteGuard();
  return currentUser ? <>{children}</> : <Navigate to="/auth" />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/onboarding"
            element={
              <PrivateRoute>
                <Onboarding />
              </PrivateRoute>
            }
          />
          <Route
            path="/ideas"
            element={
              <PrivateRoute>
                <Ideas />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/first-revenue"
            element={
              <PrivateRoute>
                <FirstRevenue />
              </PrivateRoute>
            }
          />
          <Route
            path="/local"
            element={
              <PrivateRoute>
                <LocalOpportunities />
              </PrivateRoute>
            }
          />
          <Route
            path="/local/results"
            element={
              <PrivateRoute>
                <LocalResults />
              </PrivateRoute>
            }
          />
          <Route
            path="/pricing"
            element={
              <PrivateRoute>
                <Pricing />
              </PrivateRoute>
            }
          />
          <Route
            path="/pro-success"
            element={
              <PrivateRoute>
                <ProSuccess />
              </PrivateRoute>
            }
          />
          <Route
            path="/roadmap/:ideaId"
            element={
              <PrivateRoute>
                <Roadmap />
              </PrivateRoute>
            }
          />
          <Route
            path="/storybrand-roadmap"
            element={
              <PrivateRoute>
                <StoryBrandRoadmap />
              </PrivateRoute>
            }
          />
          <Route
            path="/master-sheet"
            element={
              <PrivateRoute>
                <MasterSheet />
              </PrivateRoute>
            }
          />
          <Route
            path="/resources"
            element={
              <PrivateRoute>
                <Resources />
              </PrivateRoute>
            }
          />
          <Route
            path="/brand-identity"
            element={
              <PrivateRoute>
                <BrandIdentity />
              </PrivateRoute>
            }
          />
          <Route
            path="/logo-editor"
            element={
              <PrivateRoute>
                <LogoEditor />
              </PrivateRoute>
            }
          />
          <Route
            path="/marketing-assets"
            element={
              <PrivateRoute>
                <MarketingPlaybook />
              </PrivateRoute>
            }
          />
          <Route
            path="/build-site"
            element={
              <PrivateRoute>
                <WebsiteBuilder />
              </PrivateRoute>
            }
          />
          <Route
            path="/operations"
            element={
              <PrivateRoute>
                <Operations />
              </PrivateRoute>
            }
          />
          <Route
            path="/scale-optimize"
            element={
              <PrivateRoute>
                <ScaleOptimize />
              </PrivateRoute>
            }
          />
          <Route
            path="/saved-ideas"
            element={
              <PrivateRoute>
                <SavedIdeas />
              </PrivateRoute>
            }
          />
          <Route
            path="/saved-names"
            element={
              <PrivateRoute>
                <SavedNames />
              </PrivateRoute>
            }
          />
          <Route
            path="/nano-generator"
            element={
              <PrivateRoute>
                <NanoGenerator />
              </PrivateRoute>
            }
          />
          <Route
            path="/storybrand-wizard"
            element={
              <PrivateRoute>
                <StoryBrandWizard />
              </PrivateRoute>
            }
          />
          <Route
            path="/website"
            element={
              <PrivateRoute>
                <Website />
              </PrivateRoute>
            }
          />
          <Route
            path="/manage-website/:websiteId"
            element={
              <PrivateRoute>
                <ManageWebsite />
              </PrivateRoute>
            }
          />
          <Route
            path="/marketing-strategy"
            element={
              <PrivateRoute>
                <MarketingStrategy />
              </PrivateRoute>
            }
          />
          <Route
            path="/playbook"
            element={
              <PrivateRoute>
                <MarketingPlaybook />
              </PrivateRoute>
            }
          />
          <Route
            path="/playbook/:slug"
            element={
              <PrivateRoute>
                <PlatformPlaybook />
              </PrivateRoute>
            }
          />
          <Route
            path="/legal"
            element={
              <PrivateRoute>
                <LegalFoundation />
              </PrivateRoute>
            }
          />
          <Route
            path="/legal/structure"
            element={
              <PrivateRoute>
                <LegalStructure />
              </PrivateRoute>
            }
          />
          <Route
            path="/legal/form-llc"
            element={
              <PrivateRoute>
                <FormLLC />
              </PrivateRoute>
            }
          />
          <Route
            path="/legal/ein"
            element={
              <PrivateRoute>
                <GetEIN />
              </PrivateRoute>
            }
          />
          <Route
            path="/legal/bank"
            element={
              <PrivateRoute>
                <BusinessBank />
              </PrivateRoute>
            }
          />
          <Route
            path="/legal/insurance"
            element={
              <PrivateRoute>
                <BusinessInsurance />
              </PrivateRoute>
            }
          />
          <Route
            path="/legal/licenses"
            element={
              <PrivateRoute>
                <LocalLicenses />
              </PrivateRoute>
            }
          />
          <Route
            path="/mission-control"
            element={
              <PrivateRoute>
                <MissionControl />
              </PrivateRoute>
            }
          />
          </Routes>
          <MissionControlFAB />
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;
