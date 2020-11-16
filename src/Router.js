import React from 'react'
import { View, StyleSheet } from 'react-native'
import { updateAction } from './Actions'

const historyChangeListeners = []

export const onAddHistoryChangeListener = func => {
    historyChangeListeners.push(func)
}

const onHistoryChange = (prevScreenName, nextScreenName) => {
    historyChangeListeners.forEach(listener => {
        listener({
            prevScreenName,
            nextScreenName
        })
    })
}

export default class Router extends React.Component {
    constructor(props) {
        super(props);

        this.state = {

        }

        this.rootRef = null;
        this.history = ['root']
    }

    componentDidMount() {
        if (React.Children.count(this.props.children) != 1) {
            throw new Error("Root element must be one")
        }


        updateAction("push", this.push)
        updateAction("pop", this.pop)
    }

    callOnHistoryChange = (prev, next) => {
        if (this.props.onHistoryChange) {
            this.props.onHistoryChange(prev, next)
        }
        onHistoryChange(prev, next)
    }

    push = (screenName, screenProps, naviationParams) => {
        this.callOnHistoryChange(this.history[this.history.length - 1], screenName)
        this.history.push(screenName)
        if (this.rootRef && this.rootRef.push) {
            this.rootRef.push(screenName, screenProps, naviationParams)
        }
    }

    pop = (naviationParams) => {
        if (this.history.length > 1) {
            this.callOnHistoryChange(this.history[this.history.length - 1], this.history[this.history.length - 2])
            this.history = this.history.slice(0, -1)
        }
        if (this.rootRef && this.rootRef.pop) {
            this.rootRef.pop(naviationParams)
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



