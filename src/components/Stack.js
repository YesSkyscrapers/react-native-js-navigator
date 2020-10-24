import React from 'react'
import { View, StyleSheet, Animated, Dimensions } from 'react-native'
import classMapping from '../utils/classMapping'

let outerIndex = 0;

export default class Stack extends React.PureComponent {
    constructor(props) {
        super(props);


        this.state = {
            stack: [],
            elementMap: {},
        }

        this.screenWidth = Dimensions.get('screen').width
    }

    getIndex = (name) => {
        return `${name}${outerIndex++}`
    }

    componentDidMount() {
        const newElementMap = React.Children.map(this.props.children, child => {
            return ({
                type: child.type.name,
                props: child.props,
                key: child.key,
            })
        })

        if (newElementMap.length == 0) {
            throw new Error("Stack must have at least one element")
        }

        let initialStack = [this.createObjectElement(newElementMap[0])]

        this.setState({
            elementMap: newElementMap,
            stack: initialStack
        })
    }

    createObjectElement = (_element, _props = {}, disableAnimation = true) => {
        let element = {
            ..._element,
            transitionAnimation: disableAnimation ? new Animated.Value(0) : new Animated.Value(this.screenWidth)
        }
        const newIndex = this.getIndex(element.type);
        element.element = (
            <Animated.View key={newIndex} style={[styles.sceneContainer, { transform: [{ translateX: element.transitionAnimation }] }]}>
                {
                    React.createElement(classMapping.getType(element.type), {
                        ...element.props,
                        ..._props,
                        key: newIndex,
                        ref: _ref => element.ref = _ref
                    })
                }
            </Animated.View>
        )

        return element;
    }

    push = (screenName, screenProps) => {
        let sameElements = Object.values(this.state.elementMap).filter(element => element.key == screenName);
        if (sameElements.length > 0) {
            let newStack = this.state.stack.concat([this.createObjectElement(sameElements[0], screenProps, false)])

            this.setState({
                stack: newStack
            })
            return true;
        } else {
            if (this.state.stack.length > 0) {
                let lastElement = this.state.stack[this.state.stack.length - 1]
                if (lastElement.type != 'Scene') {
                    return lastElement.ref.push(screenProps, screenProps)
                } else {
                    return false
                }
            } else {
                return false;
            }
        }
    }

    pop = () => {
        if (this.state.stack.length > 1) {
            let lastElement = this.state.stack[this.state.stack.length - 1];
            if (lastElement.type == 'Scene' || lastElement.ref.pop()) {
                let newStack = this.state.stack.filter((element, index) => index < this.state.stack.length - 1)
                this.setState({
                    stack: newStack
                }, () => {
                    lastElement.element = null;
                })
            }
        }

    }


    render() {
        return (
            <View style={{ flex: 1 }}>
                {
                    this.state.stack.map((elementObject, index) => elementObject.element)
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
