import React from 'react';
import PropTypes from 'prop-types';
import autoprefixer from './prefixer';

export default class TabListItem extends React.Component {
  static propTypes = {
    item: PropTypes.shape({
      element: PropTypes.element.isRequired,
      width: PropTypes.number.isRequired,
      left: PropTypes.number.isRequired,
    }).isRequired,
    onChange: PropTypes.func.isRequired,
    style: PropTypes.object,
    fitInContainer: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
    noLeftPadding: PropTypes.bool,
    noRightPadding: PropTypes.bool,
    className: PropTypes.string,
    isItemActive: PropTypes.func.isRequired,
    activeStyle: PropTypes.object.isRequired,
  };

  checkChanged = (width, left) => {
    return this.props.item.width !== width || this.props.item.left !== left;
  }

  refListItemDetector = (ref) => {
    if(! ref) {
      return;
    }
    // New change has happened
    if(this.checkChanged(ref.clientWidth, ref.offsetLeft)) {
      this.props.onChange(this.props.item, ref.clientWidth, ref.offsetLeft);
    }
  }

  getItemStyle() {
    let style = {...this.props.style};

    // Fitting item in the container
    if(this.props.fitInContainer) {
      style.flexShrink = 1;
      style.flexGrow = 1;
    } else {
      style.flexShrink = 0;
    }

    // Remove left padding
    if(this.props.noLeftPadding) {
      style.paddingLeft = 0;
      style.justifyContent = 'flex-start';
    }

    // Remove right padding
    if(this.props.noRightPadding) {
      style.paddingRight = 0;
      style.justifyContent = 'flex-end';
    }

    if(this.props.isItemActive(this.props.item)) {
      style = { ...style, ...this.props.activeStyle };
    }

    const mainItemStyle = {
      padding: '20px',
      cursor: 'pointer',
      userSelect: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }

    return autoprefixer({
      ...mainItemStyle,
      ...style,
    });
  }

  render() {
    return (
      <li
        ref={this.refListItemDetector.bind(this)}
        onClick={() => this.props.onClick(this.props.item)}
        style={this.getItemStyle()}
        className={this.props.className}
      >
        {this.props.item.element}
      </li>
    );
  }
}
