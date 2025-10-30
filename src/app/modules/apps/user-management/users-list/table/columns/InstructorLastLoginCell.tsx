import { FC } from "react";

type Props = {
  lastLogin?: string;
};

const InstructorLastLoginCell: FC<Props> = ({ lastLogin }) => {
  const formatDateTime = (dateString?: string) => {
    if (!dateString) {
      return {
        formatted: "Never",
        relative: "No login recorded",
        isRecent: false,
      };
    }

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    let timeAgo = "";
    let isRecent = false;

    if (diffMins < 1) {
      timeAgo = "Just now";
      isRecent = true;
    } else if (diffMins < 60) {
      timeAgo = `${diffMins} min ago`;
      isRecent = true;
    } else if (diffHours < 24) {
      timeAgo = `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
      isRecent = diffHours < 6;
    } else {
      timeAgo = `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
      isRecent = false;
    }

    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    const formattedDate = date.toLocaleDateString("en-US", options);

    return {
      formatted: formattedDate,
      relative: timeAgo,
      isRecent,
    };
  };

  const { formatted, relative, isRecent } = formatDateTime(lastLogin);

  return (
    <div className="d-flex flex-column">
      <span className="text-gray-800 fw-bold mb-1">{formatted}</span>
      <span className={`fs-7 ${isRecent ? "text-success" : "text-muted"}`}>
        {isRecent && (
          <i className="ki-duotone ki-check-circle fs-6 me-1">
            <span className="path1"></span>
            <span className="path2"></span>
          </i>
        )}
        {relative}
      </span>
    </div>
  );
};

export { InstructorLastLoginCell };
