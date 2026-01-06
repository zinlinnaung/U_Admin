import { useIntl } from "react-intl";
import { AsideMenuItemWithSubMain } from "./AsideMenuItemWithSubMain";
import { AsideMenuItemWithSub } from "./AsideMenuItemWithSub";
import { AsideMenuItem } from "./AsideMenuItem";

export function AsideMenuMain() {
  const intl = useIntl();
  return (
    <>
      <AsideMenuItem
        to="/dashboard"
        title="Dashboard"
        fontIcon="bi-house fs-2"
        bsTitle={intl.formatMessage({ id: "MENU.DASHBOARD" })}
        className="py-2"
      />
      {/* <AsideMenuItem
        to="/roles"
        title="Role"
        fontIcon="bi-house fs-2"
        bsTitle={intl.formatMessage({ id: "MENU.DASHBOARD" })}
        className="py-2"
      /> */}
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
        // className="py-2"
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

      <AsideMenuItemWithSubMain
        to="/apps/user-management"
        title="Users"
        fontIcon="bi-file-text"
        bsTitle="Users"
      >
        {/* <AsideMenuItemWithSub
          to="/crafted/pages/profile"
          title="Profile"
          hasBullet={true}
        >
          <AsideMenuItem
            to="/crafted/pages/profile/overview"
            title="Overview"
            bsTitle="Overview"
            hasBullet={true}
          />
          <AsideMenuItem
            to="/crafted/pages/profile/projects"
            title="Projects"
            bsTitle="Projects"
            hasBullet={true}
          />
          <AsideMenuItem
            to="/crafted/pages/profile/campaigns"
            title="Campaigns"
            bsTitle="Campaigns"
            hasBullet={true}
          />
          <AsideMenuItem
            to="/crafted/pages/profile/documents"
            title="Documents"
            bsTitle="Documents"
            hasBullet={true}
          />
          <AsideMenuItem
            to="/crafted/pages/profile/connections"
            title="Connections"
            hasBullet={true}
            bsTitle="Connections"
          />
        </AsideMenuItemWithSub>

        <AsideMenuItemWithSub
          to="/crafted/pages/wizards"
          title="Wizards"
          hasBullet={true}
        >
          <AsideMenuItem
            to="/crafted/pages/wizards/horizontal"
            title="Horizontal"
            hasBullet={true}
            bsTitle="Horizontal"
          />
          <AsideMenuItem
            to="/crafted/pages/wizards/vertical"
            title="Vertical"
            bsTitle="Vertical"
            hasBullet={true}
          />
        </AsideMenuItemWithSub>

        <AsideMenuItemWithSub
          to="/crafted/accounts"
          title="Accounts"
          hasBullet={true}
        >
          <AsideMenuItem
            to="/crafted/account/overview"
            title="Overview"
            hasBullet={true}
            bsTitle="Overview"
          />
          <AsideMenuItem
            to="/crafted/account/settings"
            title="Settings"
            hasBullet={true}
            bsTitle="Settings"
          />
        </AsideMenuItemWithSub>

        <AsideMenuItemWithSub
          to="/crafted/widgets"
          title="Widgets"
          hasBullet={true}
        >
          <AsideMenuItem
            to="/crafted/widgets/lists"
            title="Lists"
            bsTitle="Lists"
            hasBullet={true}
          />
          <AsideMenuItem
            to="/crafted/widgets/statistics"
            title="Statistics"
            bsTitle="Statistics"
            hasBullet={true}
          />
          <AsideMenuItem
            to="/crafted/widgets/charts"
            title="Charts"
            bsTitle="Charts"
            hasBullet={true}
          />
          <AsideMenuItem
            to="/crafted/widgets/mixed"
            title="Mixed"
            bsTitle="Mixed"
            hasBullet={true}
          />
          <AsideMenuItem
            to="/crafted/widgets/tables"
            title="Tables"
            bsTitle="Tables"
            hasBullet={true}
          />
          <AsideMenuItem
            to="/crafted/widgets/feeds"
            title="Feeds"
            bsTitle="Feeds"
            hasBullet={true}
          />
        </AsideMenuItemWithSub>

        <AsideMenuItemWithSub to="/apps/chat" title="Chat" hasBullet={true}>
          <AsideMenuItem
            to="/apps/chat/private-chat"
            title="Private Chat"
            bsTitle="Private Chat"
            hasBullet={true}
          />
          <AsideMenuItem
            to="/apps/chat/group-chat"
            title="Group Chart"
            bsTitle="Group Chart"
            hasBullet={true}
          />
          <AsideMenuItem
            to="/apps/chat/drawer-chat"
            title="Drawer Chart"
            bsTitle="Drawer Chart"
            hasBullet={true}
          />
        </AsideMenuItemWithSub>
        <AsideMenuItemWithSub to="/error" title="Errors" hasBullet={true}>
          <AsideMenuItem to="/error/404" title="Error 404" hasBullet={true} />
          <AsideMenuItem to="/error/500" title="Error 500" hasBullet={true} />
        </AsideMenuItemWithSub> */}

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
        fontIcon="bi-house-door fs-2" // 🏠 Better icon for homepage
        bsTitle={intl.formatMessage({ id: "MENU.Home" })}
      >
        <AsideMenuItem
          to="/apps/home/sliders"
          title="Sliders"
          hasBullet={true}
          fontIcon="bi-images" // 🖼 multiple images = slider/banner
          bsTitle="Slider Management"
        />

        <AsideMenuItem
          to="/apps/home-category"
          title="Home Category"
          hasBullet={true}
          fontIcon="bi-grid-3x3-gap" // 🗂 clean grid for category blocks
          bsTitle="Home Category"
        />
      </AsideMenuItemWithSubMain>

      {/* <AsideMenuItemWithSubMain
        to="/builder"
        title="Resources"
        bsTitle="Resources"
        fontIcon="bi-gear"
      >
        <AsideMenuItem
          to="/builder"
          title="Layout builder"
          fontIcon="bi-layers fs-3"
        />
        <AsideMenuItem
          to={import.meta.env.VITE_APP_PREVIEW_DOCS_URL + "/changelog"}
          outside={true}
          title={`Changelog ${import.meta.env.VITE_APP_VERSION}`}
          fontIcon="bi-card-text fs-3"
        />
      </AsideMenuItemWithSubMain> */}
    </>
  );
}
