import React from 'react';
import './Button.css';

const STYLES = ['btn--primary', 'btn--outline', 'btn--alt']; // btn--primary is solid white, outline is transparent

const SIZES = ['btn--medium', 'btn--large'];

export const Button = ({
    children,
    type,
    onClick,
    buttonStyle,
    buttonSize
}) => {
    const checkButtonStyle = STYLES.includes(buttonStyle) ? buttonStyle : STYLES[0]; // by default, btn will be btn--primary style
    const checkButtonSize = SIZES.includes(buttonSize) ? buttonSize : SIZES[0];

    // if someone creates <Button> XYZ </Button>, XYZ will be the children and will be between <button> tags
    return (
            <button
            className={`btn ${checkButtonStyle} ${checkButtonSize}`}
            onClick={onClick}
            type={type}
            >
                {children}
            </button>
    )


}
