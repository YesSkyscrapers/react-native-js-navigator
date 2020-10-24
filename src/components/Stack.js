import React from 'react'
import { View, StyleSheet } from 'react-native'
import classMapping from '../utils/classMapping'

let outerIndex = 0;

export default class Stack extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            stack: [],
            elementMap: {}
        }
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
        let sameElements = Object.values(this.state.elementMap).filter(element => element.key == screenName);
        if (sameElements.length > 0) {
            let newStack = this.state.stack.concat([this.createObjectElement(sameElements[0], screenProps)])

            this.setState({
                stack: newStack
            })
        } else {

        }
    }

    pop = () => {
        if (this.state.stack.length > 1) {
            let lastElement = this.state.stack[this.state.stack.length - 1];
            let newStack = this.state.stack.filter((element, index) => index < this.state.stack.length - 1)
            this.setState({
                stack: newStack
            }, () => {
                lastElement.element = null;
            })
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
