import React from 'react';
import PropTypes from 'prop-types';
import Hammer from 'react-hammerjs';
import Measure from 'react-measure';
import { Motion, spring } from '@gmr-fms/react-motion';
import differenceBy from 'lodash.differenceby';
import ListBorder from './ListBorder';
import TabList from './TabList';
import autoprefixer from './prefixer';
import Animator from './Animator';
import debounce from 'lodash.debounce';

const RESIZE_FREQUENCY = 150;
export default class Tabs extends React.Component {
  static propTypes = {
    /**
     * Array of tabs to render.
     */
    items: PropTypes.arrayOf(PropTypes.element).isRequired,
    /**
     * When an item is clicked, this is called with `(item, index)`.
     */
    onItemClick: PropTypes.func.isRequired,
    /**
     * This is only useful if you want to control the active item index from outside.
     */
    activeItemIndex: PropTypes.number,
    /**
     * Item class name.
     */
    itemClassName: PropTypes.string,
    /**
     * Item style.
     */
    itemStyle: PropTypes.object,
    /**
     * Active item style.
     */
    activeStyle: PropTypes.object,
    /**
     * Whether or not to align center if items total width smaller than container width.
     */
    alignCenter: PropTypes.bool,
    /**
     * This option will fit all items on desktop
     */
    fitItems: PropTypes.bool,
    /**
     * This prop defines if the first item doesnt have left padding.
     * We use this to calculate the border position for the first element.
     */
    noFirstLeftPadding: PropTypes.bool,
    /**
     * This prop defines if the last item doesnt have right padding.
     * We use this to calculate the border position for the last element.
     */
    noLastRightPadding: PropTypes.bool,
    /**
     * Border position.
     */
    borderPosition: PropTypes.oneOf(['top', 'bottom']),
    /**
     * Border color.
     */
    borderColor: PropTypes.string,
    /**
     * Border thickness in pixels.
     */
    borderThickness: PropTypes.number,
    /**
     * Border width ratio from the tab width.
     * Setting this to 1 will set border width to exactly the tab width.
     */
    borderWidthRatio: PropTypes.number,
    /**
     * This value is used when user tries to drag the tabs far to right or left.
     * Setting this to 100 for example user will be able to  drag the tabs 100px
     * far to right and left.
     */
    safeMargin: PropTypes.number,
    /**
     * Initial translation. Ignore this.
     */
    initialTranslation: PropTypes.number,
    /**
     * React motion configurations.
     * [More about this here](https://github.com/chenglou/react-motion#--spring-val-number-config-springhelperconfig--opaqueconfig)
     */
    stiffness: PropTypes.number,
    /**
     * React motion configurations.
     * [More about this here](https://github.com/chenglou/react-motion#--spring-val-number-config-springhelperconfig--opaqueconfig)
     */
    damping: PropTypes.number,
    /**
     * Drag resistance coeffiecent.
     * Higher resitance tougher the user can drag the tabs.
     */
    resistanceCoeffiecent: PropTypes.number,
    /**
     * Gravity acceleration.
     * Higher resitance tougher the user can drag the tabs.
     */
    gravityAccelarion: PropTypes.number,
    /**
     * [Learn more](https://en.wikipedia.org/wiki/Drag_coefficient)
     */
    dragCoefficient: PropTypes.number,
  };

  static defaultProps = {
    resistanceCoeffiecent: 0.5,
    gravityAccelarion: 9.8,
    dragCoefficient: 0.04,
    stiffness: 170,
    damping: 26,

    activeItemIndex: 0,
    safeMargin: 100,
    borderPosition: 'bottom',
    borderColor: '#333',
    borderThickness: 2,
    borderWidthRatio: 1,
    alignCenter: true,
    activeStyle: {},
    noFirstLeftPadding: false,
    noLastRightPadding: false,
    fitItems: false,
    itemStyle: {},
    initialTranslation: 0,
  };

  constructor(props) {
    super(props);
    this.currentFrame = {
      translateX: 0,
    };

    const items = this.formatItems(this.props.items);

    this.animator = new Animator(items);
    this.updateAnimatorFromProps(this.props);

    this.state = {
      items,
      activeItemIndex: this.props.activeItemIndex,
      translateX: 0,
      borderWidth: 0,
      borderTranslateX: 0,
    };

    this.onWrapperResize();
  }

  componentDidMount() {
    window.addEventListener('resize', this.onWrapperResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWrapperResize);
  }

  componentWillReceiveProps(nextProps) {
    this.updateAnimatorFromProps(nextProps);

    if(nextProps.activeItemIndex !== this.props.activeItemIndex) {
      this.setState({ activeItemIndex: nextProps.activeItemIndex });
    }

    if(!this.checkEqualItems(nextProps.items, this.props.items)) {
      const items = this.formatItems(nextProps.items);
      this.animator.setItems(items);
      this.setState({ items });
    }
  }

  componentWillUpdate(nextProps, nextState) {
    if(nextState.activeItemIndex !== this.state.activeItemIndex
      || nextState.requestCenterActiveItem
      || nextState.items !== this.state.items) {
      // 
      this.setState({
        ...this.getCenterItemState(nextState.items, nextState.activeItemIndex),
        requestCenterActiveItem: false,
      });
    }
  }

  handleWrapperResize = () => {
    this.detectRefContainerWidth();
    
    // Force center active item on resize
    this.setState({
      requestCenterActiveItem: true
    });
  }

  onWrapperResize = debounce(this.handleWrapperResize, RESIZE_FREQUENCY);

  formatItems = (items) => {
    return items.map(element => ({ element, width: 0, left: 0}));
  }

  checkEqualItems = (items1, items2) => {
    return items1 === items2;
  }

  onPanStart = (e) => {
    this.animator.startDrag();
  }

  onPanEnd = (e) => {
    this.animator.endDrag();

    // 
    this.setState({
      translateX: this.animator.calculateSwipeReleaseTranslateX(e.deltaX),
    });
  }

  onPan = (e) => {
    this.setState({
      translateX: this.animator.calculateSwipeTranslateX(e.deltaX),
    });
  }

  getTranslateStyle = (translateX) => {
    this.animator.setCurrentTranslateX(translateX);
    return {
      transform: `translate(${translateX}px, 0)`
    };
  }

  getWrapperStyle = () => {
    return autoprefixer({
      display: 'flex',
      width: '100%',
      overflow: 'hidden'
    });
    
  }

  getContainerStyle = () => {
    return autoprefixer({
      position: 'relative',
      width: '100%',
      overflow: 'hidden',
      textAlign: 'center',
    });
  }

  getCenterItemState = (items, activeItemIndex) => {
    let item = items[activeItemIndex];
    // If item doesnt exist then revert to the first item and call the onItemClick
    if(! item) {
      item = items[0];
      this.onItemClick(item, activeItemIndex);
    }
    return {
      borderWidth: this.animator.getBorderWidth(item),
      translateX: this.animator.calculateItemTranslateX(item),
      borderTranslateX: this.animator.calculateBorderTranslateX(item),
    };
  }

  updateAnimatorFromProps = (props) => {
    this.animator.setBorderWidthRatio(props.borderWidthRatio);
    this.animator.setSafeMargin(props.safeMargin);
    this.animator.setInitialTranslation(props.initialTranslation);
    this.animator.setNoFirstLeftPadding(props.noFirstLeftPadding);
    this.animator.setNoLastRightPadding(props.noLastRightPadding);
    this.animator.setResistanceCoeffiecent(props.resistanceCoeffiecent);
  }

  getInitialFrame = () => {
    return {
      translateX: this.state.translateX,
      borderWidth: this.state.borderWidth,
      borderTranslateX: this.state.borderTranslateX,
    };
  }

  calculateNextFrame = () => {
    const options = {
      stiffness: this.props.stiffness,
      damping: this.props.damping,
    };
    return {
      translateX: spring(this.state.translateX, options),
      borderTranslateX: spring(this.state.borderTranslateX, options),
      borderWidth: spring(this.state.borderWidth, options),
    };
  }

  detectRefContainerWidth = () => {
    if(this.refContainer) {
      this.animator.setContainerWidth(this.refContainer
        .parentElement.parentElement.parentElement.clientWidth);
    }
  }

  onItemClick = (item) => {
    const index = this.getItemIndex(item);
    this.setState({
      requestToCenterItem: true,
      activeItemIndex: index,
    });
    this.props.onItemClick(item, index);
  }

  onItemChange = (item, width, left) => {
    const index = this.state.items.indexOf(item);

    const items = [
      ...this.state.items.slice(0, index),
      { ...item, width, left },
      ...this.state.items.slice(index + 1),
    ];

    this.animator.setItems(items);
    this.setState({ items });
  }

  isItemActive = (item) => {
    return this.state.activeItemIndex === this.getItemIndex(item);
  }

  getItemIndex = (item) => {
    return this.state.items.indexOf(item);
  }

  renderList(translateX, borderTranslateX, borderWidth) {
    const borderElement = (
      <ListBorder
        borderThickness={this.props.borderThickness}
        borderColor={this.props.borderColor}
        borderTranslateX={borderTranslateX}
        borderWidth={borderWidth}
      />
    );

    return (
      <div style={this.getTranslateStyle(translateX)}>
        {this.props.borderPosition === 'top' ? borderElement : null}

        <TabList
          items={this.state.items}
          containerWidth={this.animator.getContainerWidth()}
          alignCenter={this.props.alignCenter}
          itemStyle={this.props.itemStyle}
          fitItems={this.props.fitItems}
          onItemClick={this.onItemClick}
          onItemChange={this.onItemChange}
          noFirstLeftPadding={this.props.noFirstLeftPadding}
          noLastRightPadding={this.props.noLastRightPadding}
          itemClassName={this.props.itemClassName}
          activeStyle={this.props.activeStyle}
          isItemActive={this.isItemActive}
        />

        {this.props.borderPosition === 'bottom' ? borderElement : null}
      </div>
    );
  }

  render() {
    return (
      <div style={this.getWrapperStyle()} ref={ref => this.refWrapper = ref}>
        <Measure ref={ref => this.refMeasure = ref} bounds>
          {({ measureRef }) => (
            <div ref={measureRef}>
              <Hammer onPanStart={this.onPanStart}
                onPanEnd={this.onPanEnd} onPan={this.onPan}>
                <div style={this.getContainerStyle()}>
                  <div ref={ref => this.refContainer = ref}>
                    <Motion
                      defaultStyle={this.getInitialFrame()}
                      style={this.calculateNextFrame()}>
                      {({ translateX, borderTranslateX, borderWidth }) =>
                        this.renderList(translateX, borderTranslateX, borderWidth)}
                    </Motion>
                  </div>
                </div>
              </Hammer>
            </div>
          )}
        </Measure>
      </div>
    );
  }
}