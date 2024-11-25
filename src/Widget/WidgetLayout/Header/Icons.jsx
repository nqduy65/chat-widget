import {
  TrashIcon,
  XMarkIcon,
  CheckIcon,        // Import the Check icon
  DocumentCheckIcon, // Import the Save icon
  ArrowPathIcon
} from "@heroicons/react/24/outline";

export const Icon = ({ name }) => {
  if (name === "Sync") {
    return <ArrowPathIcon className="h-4 w-4" />; // Use Sync icon (ArrowPathIcon)
  }
  if (name === "Clear Chat") {
    return <TrashIcon className="h-4 w-4" />;
  }
  if (name === "Close") {
    return <XMarkIcon className="h-4 w-4" />;
  }
  if (name === "Check") {
    return <CheckIcon className="h-4 w-4" />; // Add Check icon
  }
  if (name === "Save") {
    return <DocumentCheckIcon className="h-4 w-4" />; // Add Save icon
  }
};
