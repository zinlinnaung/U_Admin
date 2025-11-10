import { FC, lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { MasterLayout } from "../../_metronic/layout/MasterLayout";
import TopBarProgress from "react-topbar-progress-indicator";
import { DashboardWrapper } from "../pages/dashboard/DashboardWrapper";
import { getCSSVariableValue } from "../../_metronic/assets/ts/_utils";
import { WithChildren } from "../../_metronic/helpers";
import BuilderPageWrapper from "../pages/layout-builder/BuilderPageWrapper";
import { InstructorsListWrapper } from "../modules/apps/user-management/users-list/InstructorsList";
import { StudentsListWrapper } from "../modules/apps/student/student-list/StudentsList";
import RolePage from "../modules/roles/RolePage";
import PermissionPage from "../modules/roles/PermissionPage";

const PrivateRoutes = () => {
  const ProfilePage = lazy(() => import("../modules/profile/ProfilePage"));
  const WizardsPage = lazy(() => import("../modules/wizards/WizardsPage"));
  const AccountPage = lazy(() => import("../modules/accounts/AccountPage"));
  const WidgetsPage = lazy(() => import("../modules/widgets/WidgetsPage"));
  const ChatPage = lazy(() => import("../modules/apps/chat/ChatPage"));
  const StudentPage = lazy(
    () => import("../modules/apps/student/StudentsPage")
  );
  // const UsersPage = lazy(
  //   () => import("../modules/apps/user-management/UsersPage")
  // );
  const CoursePage = lazy(() => import("../modules/apps/courses/CoursePage")); // ✅ ADD THIS
  const CourseCatagoryPage = lazy(
    () => import("../modules/apps/courses/CourseCategoryList")
  );

  return (
    <Routes>
      <Route element={<MasterLayout />}>
        {/* Redirect to Dashboard after success login/registration */}
        <Route path="auth/*" element={<Navigate to="/dashboard" />} />

        {/* Pages */}
        <Route path="dashboard" element={<DashboardWrapper />} />
        <Route path="builder" element={<BuilderPageWrapper />} />

        {/* Lazy Modules */}
        <Route
          path="crafted/pages/profile/*"
          element={
            <SuspensedView>
              <ProfilePage />
            </SuspensedView>
          }
        />
        <Route
          path="crafted/pages/wizards/*"
          element={
            <SuspensedView>
              <WizardsPage />
            </SuspensedView>
          }
        />
        <Route
          path="crafted/widgets/*"
          element={
            <SuspensedView>
              <WidgetsPage />
            </SuspensedView>
          }
        />
        <Route
          path="crafted/account/*"
          element={
            <SuspensedView>
              <AccountPage />
            </SuspensedView>
          }
        />
        <Route
          path="apps/chat/*"
          element={
            <SuspensedView>
              <ChatPage />
            </SuspensedView>
          }
        />
        <Route
          path="apps/user-management/users"
          element={<InstructorsListWrapper />}
        />
        <Route
          path="apps/user-management/students"
          element={<StudentsListWrapper />}
        />
        <Route path="apps/user-management/roles" element={<RolePage />} />
        <Route
          path="apps/user-management/permissions"
          element={<PermissionPage />}
        />

        <Route
          path="apps/student"
          element={
            <SuspensedView>
              <StudentPage />
            </SuspensedView>
          }
        />
        {/* <Route
          path="apps/user"
          element={
            <SuspensedView>
              <UsersPage />
            </SuspensedView>
          }
        /> */}

        {/* ✅ NEW COURSE PAGE */}
        <Route
          path="apps/course"
          element={
            <SuspensedView>
              <CoursePage />
            </SuspensedView>
          }
        />
        <Route
          path="apps/category"
          element={
            <SuspensedView>
              <CourseCatagoryPage />
            </SuspensedView>
          }
        />

        {/* Page Not Found */}
        <Route path="*" element={<Navigate to="/error/404" />} />
      </Route>
    </Routes>
  );
};

const SuspensedView: FC<WithChildren> = ({ children }) => {
  const baseColor = getCSSVariableValue("--bs-primary");
  TopBarProgress.config({
    barColors: {
      "0": baseColor,
    },
    barThickness: 1,
    shadowBlur: 5,
  });
  return <Suspense fallback={<TopBarProgress />}>{children}</Suspense>;
};

export { PrivateRoutes };
