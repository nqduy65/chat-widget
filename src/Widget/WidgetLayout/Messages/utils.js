import moment from "moment";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const formattedTs = (ts) => {
  return moment(ts).format("ddd, MMM D, h:mm A");
};

const CustomLink = ({ children, href }) => {
  return (
    <a 
      href={href} 
      className="text-blue-500 underline hover:text-blue-700" 
      target="_blank" 
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
};
export const MardownText = ({ text }) => {
  return (
    <ReactMarkdown 
      children={text} 
      remarkPlugins={[remarkGfm]} 
      components={{
        a: CustomLink, // Use the custom link component for anchor tags
      }}
    />
  );
};
