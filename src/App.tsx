import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useRouteGuard } from './hooks/useRouteGuard';
import Homepage from './pages/Homepage';
import AuthPage from './pages/AuthPage';
import Onboarding from './pages/Onboarding';
import Ideas from './pages/Ideas';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import FirstRevenue from './pages/FirstRevenue';
import LocalOpportunities from './pages/LocalOpportunities';
import LocalResults from './pages/LocalResults';
import Pricing from './pages/Pricing';
import ProSuccess from './pages/ProSuccess';
import Roadmap from './pages/Roadmap';
import StoryBrandRoadmap from './pages/StoryBrandRoadmap';
import MasterSheet from './pages/MasterSheet';
import Resources from './pages/Resources';
import BrandIdentity from './pages/BrandIdentity';
import LogoEditor from './pages/LogoEditor';
import MarketingAssets from './pages/MarketingAssets';
import WebsiteBuilder from './pages/WebsiteBuilder';
import Operations from './pages/Operations';
import ScaleOptimize from './pages/ScaleOptimize';
import SavedIdeas from './pages/SavedIdeas';
import SavedNames from './pages/SavedNames';
import NanoGenerator from './pages/NanoGenerator';
import StoryBrandWizard from './pages/StoryBrandWizard';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  useRouteGuard();
  return currentUser ? <>{children}</> : <Navigate to="/auth" />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
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
                <MarketingAssets />
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
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
