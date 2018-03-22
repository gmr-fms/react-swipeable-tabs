import React from 'react';
import PropTypes from 'prop-types';
import autoprefixer from './prefixer';

export default class ListBorder extends React.Component {
  static propTypes = {
    borderThickness: PropTypes.number,
    borderColor: PropTypes.string,
    borderWidth: PropTypes.number,
    borderTranslateX: PropTypes.number,
  };

  getBorderStyle() {
    return autoprefixer({
      height: this.props.borderThickness,
      background: this.props.borderColor,
      width: this.props.borderWidth,
      transform: `translate(${this.props.borderTranslateX}px, 0)`,
    });
  }

  render() {
    return (
      <div
        style={this.getBorderStyle()}>
      </div>
    );
  }
}