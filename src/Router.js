import React from 'react'
import { View, StyleSheet } from 'react-native'
import { updateAction } from './Actions'

export default class Router extends React.Component {
    constructor(props) {
        super(props);

        this.state = {

        }

        this.rootRef = null;
    }

    componentDidMount() {
        if (React.Children.count(this.props.children) != 1) {
            throw new Error("Root element must be one")
        }


        updateAction("push", this.push)
        updateAction("pop", this.pop)
    }

    push = (screenName, screenProps) => {
        if (this.rootRef && this.rootRef.push) {
            this.rootRef.push(screenName, screenProps)
        }
    }

    pop = () => {
        if (this.rootRef && this.rootRef.pop) {
            this.rootRef.pop()
        }
    }

    render() {

        return (
            <View style={{ flex: 1 }}>
                {
                    React.cloneElement(this.props.children, {
                        ref: _ref => this.rootRef = _ref
                    })
                }
            </View>
        )
    }
}


const styles = StyleSheet.create({

})



