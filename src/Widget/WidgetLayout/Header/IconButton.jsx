import React from "react";
import PropTypes from "prop-types";
export const IconButton = ({ icon: Icon, onClick, disabled, tooltip }) => {
  return (
    <div>
      <button
        onClick={!disabled ? onClick : null}
        className={`flex items-center justify-center rounded p-2 ${
          disabled ? "cursor-not-allowed opacity-50" : ""
        }`}
        disabled={disabled} // This will visually disable the button
        title={tooltip} // Tooltip for the button
      >
        <Icon className="h-5 w-5" />
      </button>
    </div>
  );
};

IconButton.propTypes = {
  icon: PropTypes.elementType.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  tooltip: PropTypes.string,
};

IconButton.defaultProps = {
  disabled: false,
  tooltip: "",
};
