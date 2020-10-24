import React from 'react'
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native'
import classMapping from '../utils/classMapping'

let outerIndex = 0;
let TRANSITION_DURATION = 400

export default class Tab extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            tabs: [],
            activeTabIndex: 0,
            offset: new Animated.Value(0)
        }

        this.screenWidth = Dimensions.get('screen').width;
    }

    getIndex = (name) => {
        return `${name}${outerIndex++}`
    }

    componentDidMount() {
        const newTabs = React.Children.map(this.props.children, child => {
            return ({
                type: child.type.name,
                props: child.props,
                key: child.key,
            })
        })

        if (newTabs.length == 0) {
            throw new Error("Tab must have at least one element")
        }

        let initialTab = newTabs.map(element => this.createObjectElement(element))

        this.setState({
            tabs: initialTab
        })
    }

    createObjectElement = (_element, _props = {}) => {
        let element = {
            ..._element
        }
        const newIndex = this.getIndex(element.type);
        element.element = (
            React.createElement(classMapping.getType(element.type), {
                ...element.props,
                ..._props,
                key: newIndex,
                ref: _ref => element.ref = _ref
            })
        )

        return element;
    }

    push = (screenName, screenProps) => {
        let isTabChild = false;

        this.state.tabs.forEach((tab, index) => {
            if (tab.key == screenName) {
                isTabChild = true;
                tab.props = {
                    ...tab.props,
                    ...screenProps
                }
                tab.element = React.cloneElement(tab.element, tab.props)
                // tab.element = React.cloneElement(tab.element, tab.props,
                //     React.Children.map(tab.element.props.children, (child => React.cloneElement(child, tab.props))))
                this.setState({
                    activeTabIndex: index,
                    tabs: this.state.tabs
                }, () => {
                    this.startTransitionAnimation();
                })
            }
        })

        if (isTabChild) {
            return true;
        } else {

            let activeTab = this.state.tabs[this.state.activeTabIndex];
            if (activeTab.type != 'Scene') {
                return activeTab.ref.push(screenName, screenProps);
            } else {
                return false;
            }

            // let result = this.state.tabs
            //     .filter(elementInTab => elementInTab.type != 'Scene')
            //     .some(elementInTab => {
            //         return elementInTab.ref.push(screenName, screenProps);
            //     })

            // return result;

        }

    }

    pop = () => {
        let activeTab = this.state.tabs[this.state.activeTabIndex];
        if (activeTab.type != 'Scene') {
            return activeTab.ref.pop();
        } else {
            return false;
        }
    }

    startTransitionAnimation = () => {
        Animated.sequence([
            Animated.timing(this.state.offset, {
                toValue: this.state.activeTabIndex * this.screenWidth,
                duration: TRANSITION_DURATION,
                useNativeDriver: true,
                easing: Easing.out(Easing.poly(5))
            })
        ]).start();
    }


    render() {
        return (
            <View style={{ flex: 1 }}>
                <View style={{ flex: 1 }}>
                    {
                        this.state.tabs.map((elementObject, index) => {
                            return (
                                <Animated.View key={elementObject.key} style={[styles.sceneContainer, {
                                    transform: [{ translateX: Animated.add(Animated.multiply(this.state.offset, new Animated.Value(-1)), new Animated.Value(this.screenWidth * index)) }]
                                }]}>
                                    {elementObject.element}
                                </Animated.View>
                            )
                        })
                    }
                </View>
                {
                    this.props.TabComponent ? (
                        React.cloneElement(this.props.TabComponent, {
                            activeIndex: this.state.activeTabIndex,
                            activeTabKeyName: (this.state.tabs[this.state.activeTabIndex] || {}).key,
                            tabsKeyNames: this.state.tabs.map(tab => tab.key)
                        })
                    ) : null
                }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    sceneContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    }
})
