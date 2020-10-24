import React from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import classMapping from '../utils/classMapping'

let outerIndex = 0;

export default class Tab extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            tabs: [],
            activeTabIndex: 0
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
            <View key={newIndex} style={styles.sceneContainer}>
                {
                    React.createElement(classMapping.getType(element.type), {
                        ...element.props,
                        ..._props,
                        key: newIndex,
                        ref: _ref => element.ref = _ref
                    })
                }
            </View>
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
                tab.element = React.cloneElement(tab.element, tab.props, React.cloneElement(tab.element.props.children, tab.props))
                // tab.element = React.cloneElement(tab.element, tab.props,
                //     React.Children.map(tab.element.props.children, (child => React.cloneElement(child, tab.props))))
                this.setState({
                    activeTabIndex: index,
                    tabs: this.state.tabs
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

    getOffsetStyle = (index) => {
        if (index == this.state.activeTabIndex) {
            return styles.sceneContainer
        } else if (index < this.state.activeTabIndex) {
            return {
                ...styles.sceneContainer,
                right: this.screenWidth
            }
        } else if (index > this.state.activeTabIndex) {
            return {
                ...styles.sceneContainer,
                left: this.screenWidth
            }
        } else {
            return {
                ...styles.sceneContainer,
                top: 2000
            }
        }
    }


    render() {
        return (
            <View style={{ flex: 1 }}>
                <View style={{ flex: 1 }}>
                    {
                        this.state.tabs.map((elementObject, index) => {
                            return (
                                <View key={elementObject.key} style={this.getOffsetStyle(index)}>
                                    {elementObject.element}
                                </View>
                            )
                        })
                    }
                </View>
                {
                    this.props.TabComponent ? (
                        React.cloneElement(this.props.TabComponent, {
                            activeIndex: this.state.activeTabIndex,
                            activeTabKeyName: (this.state.tabs[this.state.activeTabIndex] || {}).key
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
