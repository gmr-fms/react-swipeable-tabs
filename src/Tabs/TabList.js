import React from 'react';
import PropTypes from 'prop-types';
import autoprefixer from './prefixer';
import TabListItem from './TabListItem';

export default class TabList extends React.Component {

  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
      element: PropTypes.element.isRequired,
      width: PropTypes.number.isRequired,
      left: PropTypes.number.isRequired,
    })).isRequired,
    alignCenter: PropTypes.bool,
    onItemChange: PropTypes.func.isRequired,
    itemStyle: PropTypes.object,
    fitItems: PropTypes.bool,
    onItemClick: PropTypes.func.isRequired,
    noFirstLeftPadding: PropTypes.bool,
    noLastRightPadding: PropTypes.bool,
    itemClassName: PropTypes.string,
    containerWidth: PropTypes.number,
    activeStyle: PropTypes.object.isRequired,
    isItemActive: PropTypes.func.isRequired,
  };

  /**
   * Return true if the item is the first one in the list
   * @param  {object}  item
   * @return {Boolean}
   */
  isFirstItem(item) {
    return this.props.items[0] === item;
  }

  /**
   * Return true if the item is the last one
   * @param  {object}  item
   * @return {Boolean}
   */
  isLastItem(item) {
    return this.props.items.indexOf(item) === this.props.items.length - 1;
  }

  /**
   * Calculate list width from its elements
   * @return {number}
   */
  getListWidth() {
    let totalWidth = 0;
    this.props.items.forEach(item => totalWidth += item.width);
    return totalWidth;
  }

  /**
   * Return true if the list width is smaller than window
   * @return {Boolean}
   */
  isListSmallerThanWindow() {
    return this.getListWidth() < this.props.containerWidth;
  }

  getListStyle() {
    return autoprefixer({
      listStyle: 'none',
      display: 'flex',
      flexDirection: 'row',
      margin: 0,
      padding: 0,
      justifyContent: this.props.alignCenter && this.isListSmallerThanWindow() ? 'center' : undefined,
    });
  }

  renderListItems() {
    return this.props.items.map((item, key) => (
      <TabListItem
        key={key}
        item={item}
        style={this.props.itemStyle}
        fitInContainer={this.props.fitItems}
        onClick={this.props.onItemClick}
        className={this.props.itemClassName}
        noLeftPadding={this.props.noFirstLeftPadding && this.isFirstItem(item)}
        noRightPadding={this.props.noLastRightPadding && this.isLastItem(item)}
        onChange={this.props.onItemChange}
        isItemActive={this.props.isItemActive}
        activeStyle={this.props.activeStyle}
      />
    ));
  }

  render() {
    return (
      <ul style={this.getListStyle()}>
        {this.renderListItems()}
      </ul>
    );
  }
}
