import React from 'react'
import { View, StyleSheet, Animated, Dimensions, Easing } from 'react-native'
import classMapping from '../utils/classMapping'

let outerIndex = 0;
const TRANSITION_DURATION = 400;

export default class Stack extends React.PureComponent {
    constructor(props) {
        super(props);


        this.state = {
            stack: [],
            elementMap: {},
        }

        this.screenWidth = Dimensions.get('screen').width
        this.removingList = []
    }

    getIndex = (name) => {
        return `${name}${outerIndex++}`
    }

    componentDidMount() {
        const newElementMap = React.Children.map(this.props.children, child => {
            return ({
                type: child.type.name,
                props: child.props,
                elementKey: child.key,
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
        element.key = newIndex;
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

    isSetStating = false;
    setStatingStack = []
    sequentialSetState = (getState = () => ({}), callback = () => { }) => {
        if (!this.isSetStating) {
            this.isSetStating = true;
            this.setState(getState(), () => {
                this.isSetStating = false;
                if (this.setStatingStack.length > 0) {
                    let nextFunc = this.setStatingStack[0];
                    this.setStatingStack = this.setStatingStack.filter(f => f !== nextFunc);
                    nextFunc();
                }
                callback();
            })
        } else {
            this.setStatingStack.push(() => this.sequentialSetState(getState, callback));
        }
    }

    push = (screenName, screenProps) => {
        let sameElements = Object.values(this.state.elementMap).filter(element => element.elementKey == screenName);
        if (sameElements.length > 0) {
            let newElement;
            this.sequentialSetState(() => {
                newElement = this.createObjectElement(sameElements[0], screenProps, false);
                let newStack = this.state.stack.concat([newElement])
                return ({ stack: newStack })
            }, () => {
                this.startTransitionAnimations(newElement, true);
                return true
            })
        } else {
            if (this.state.stack.length > 0) {
                let lastElement = this.state.stack[this.state.stack.length - 1]
                if (lastElement.type != 'Scene') {
                    return lastElement.ref.push(screenProps, screenProps)
                } else {
                    return false
                }
            } else {
                return false
            }
        }
    }

    pop = () => {
        let activeStack = this.state.stack.filter(element => !this.removingList.includes(element.key))

        if (activeStack.length > 1) {
            let lastElement = activeStack[activeStack.length - 1];
            if (lastElement.type == 'Scene' || lastElement.ref.pop()) {
                let newStack = activeStack.filter((element, index) => index < activeStack.length - 1)
                this.removingList.push(lastElement.key)
                this.startTransitionAnimations(lastElement, false, () => {
                    this.setState({
                        stack: newStack
                    }, () => {
                        this.removingList = this.removingList.filter(key => key !== lastElement.key)
                        lastElement.element = null;
                        return true
                    })
                });

            }
        }
    }

    startTransitionAnimations = (element, isOpen = true, callback) => {
        Animated.timing(element.transitionAnimation, {
            toValue: isOpen ? 0 : this.screenWidth,
            duration: TRANSITION_DURATION,
            useNativeDriver: true,
            easing: isOpen ? Easing.out(Easing.quad) : Easing.in(Easing.quad)
        }).start(callback)
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
        left: -1,
        right: 0,
        top: 0,
        bottom: 0,
        borderLeftWidth: 1,
        borderLeftColor: 'grey'
    }
})
