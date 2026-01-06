import { useIntl } from "react-intl";
import { AsideMenuItemWithSubMain } from "./AsideMenuItemWithSubMain";
import { AsideMenuItemWithSub } from "./AsideMenuItemWithSub";
import { AsideMenuItem } from "./AsideMenuItem";
import { useAuth } from "../../../../app/modules/auth";
// 1. Import useAuth to access user data

export function AsideMenuMain() {
  const intl = useIntl();

  // 2. Get currentUser and check for Instructor role
  const { currentUser } = useAuth();
  const isInstructor = currentUser?.instructor?.roles?.some(
    (role: any) => role.name === "Instructor"
  );

  return (
    <>
      {/* Dashboard is usually visible to everyone */}
      <AsideMenuItem
        to="/dashboard"
        title="Dashboard"
        fontIcon="bi-house fs-2"
        bsTitle={intl.formatMessage({ id: "MENU.DASHBOARD" })}
        className="py-2"
      />

      {/* 3. Instructors only see Elibrary and Courses */}
      <AsideMenuItem
        to="/apps/e-library"
        title="Elibrary"
        fontIcon="bi-book fs-2"
        bsTitle={intl.formatMessage({ id: "MENU.Elibrary" })}
        className="py-2"
      />

      <AsideMenuItemWithSubMain
        to="/apps/courses"
        title="Courses"
        fontIcon="bi-mortarboard fs-2"
        bsTitle={intl.formatMessage({ id: "MENU.Courses" })}
      >
        <AsideMenuItem
          to="/apps/courses"
          title="Courses"
          hasBullet={true}
          bsTitle="User management"
        />

        <AsideMenuItem
          to="/apps/course-category"
          title="Courses Category"
          hasBullet={true}
          bsTitle="Course management"
        />

        {/* 4. Hide Templates for Instructors (Optional - keeping them if they manage their own) */}
        <AsideMenuItem
          to="/apps/certificate/list"
          title="Certificate Template"
          hasBullet={true}
          bsTitle="template management"
        />
        <AsideMenuItem
          to="/apps/feedback/list"
          title="Feedback Template"
          hasBullet={true}
          bsTitle="feedback management"
        />

        <AsideMenuItem
          to="/apps/user-on-course"
          title="User On Course"
          hasBullet={true}
          bsTitle="UserOnCourse management"
        />
      </AsideMenuItemWithSubMain>

      {/* 5. ADMIN ONLY SECTIONS - Wrapped in !isInstructor */}
      {!isInstructor && (
        <>
          <AsideMenuItemWithSubMain
            to="/apps/user-management"
            title="Users"
            fontIcon="bi-file-text"
            bsTitle="Users"
          >
            <AsideMenuItem
              to="/apps/user-management/users"
              title="Instructors"
              hasBullet={true}
              bsTitle="User management"
            />
            <AsideMenuItem
              to="/apps/user-management/students"
              title="Students"
              hasBullet={true}
              bsTitle="User management"
            />
            <AsideMenuItem
              to="/apps/user-management/roles"
              title="Roles"
              hasBullet={true}
              bsTitle="User management"
            />
            <AsideMenuItem
              to="/apps/user-management/permissions"
              title="Permissions"
              hasBullet={true}
              bsTitle="Permissions"
            />
          </AsideMenuItemWithSubMain>

          <AsideMenuItemWithSubMain
            to="/apps/home"
            title="Home"
            fontIcon="bi-house-door fs-2"
            bsTitle={intl.formatMessage({ id: "MENU.Home" })}
          >
            <AsideMenuItem
              to="/apps/home/sliders"
              title="Sliders"
              hasBullet={true}
              fontIcon="bi-images"
              bsTitle="Slider Management"
            />
            <AsideMenuItem
              to="/apps/home-category"
              title="Home Category"
              hasBullet={true}
              fontIcon="bi-grid-3x3-gap"
              bsTitle="Home Category"
            />
          </AsideMenuItemWithSubMain>
        </>
      )}
    </>
  );
}
